import { Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

export default function ViewAttendancePage() {
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role === 'admin';
  const staffDept = user?.department;

  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [attendanceRecords, setAttendanceRecords] = useState(() => academicStore.getAttendance());
  
  const [filterDept, setFilterDept] = useState(isAdmin ? 'All' : (staffDept || 'All'));
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceFilter, setAttendanceFilter] = useState('All');

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setAttendanceRecords(academicStore.getAttendance());
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const departments = useMemo(() => {
    if (!isAdmin && staffDept) {
      return [staffDept];
    }
    return ['All', ...new Set(students.map(s => s.department).filter(Boolean))];
  }, [students, isAdmin, staffDept]);

  const filteredStudentsWithAttendance = useMemo(() => {
    let list = students;
    if (!isAdmin && staffDept) {
      list = list.filter(s => s.department === staffDept);
    }
    if (filterDept !== 'All') {
      list = list.filter(s => s.department === filterDept);
    }
    
    // For the filtered students, find their morning and evening records for the date
    const dateRecords = attendanceRecords.filter(r => r.date === filterDate);
    
    return list.map(student => {
      const morningRecord = dateRecords.find(r => r.studentId === student.id && r.session === 'Morning');
      const eveningRecord = dateRecords.find(r => r.studentId === student.id && r.session === 'Evening');
      
      return {
        ...student,
        morningStatus: morningRecord ? morningRecord.status : '-',
        eveningStatus: eveningRecord ? eveningRecord.status : '-',
      };
    }).filter(s => {
      if (attendanceFilter === 'All') return true;
      if (attendanceFilter === 'Present') {
        return s.morningStatus === 'Present' || s.eveningStatus === 'Present';
      }
      if (attendanceFilter === 'Absent') {
        return s.morningStatus === 'Absent' || s.eveningStatus === 'Absent';
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [attendanceRecords, students, filterDate, filterDept, isAdmin, staffDept, attendanceFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">View Attendance History</h2>
          <p className="text-sm text-slate-400">View recorded attendance by department, batch, and date</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department</label>
            <CustomSelect
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
              }}
              className="w-full"
              disabled={!isAdmin && !!staffDept}
            >
              {isAdmin && <option value="All">All Departments</option>}
              {departments.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </CustomSelect>
          </div>


          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Status</label>
            <CustomSelect
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="w-full"
            >
              <option value="All">All Students</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </CustomSelect>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-800 p-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Eye className="w-5 h-5 text-sky-400" />
            Attendance Records for {filterDate} {filterDept !== 'All' ? `(${filterDept})` : ''}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Student</th>
                <th className="px-5 py-3.5 font-semibold text-center">Morning Session</th>
                <th className="px-5 py-3.5 font-semibold text-center">Evening Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStudentsWithAttendance.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-5 py-8 text-center text-slate-400">
                    No attendance recorded for the selected date and filters.
                  </td>
                </tr>
              ) : filteredStudentsWithAttendance.map((student) => (
                <tr key={student.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4">
                    <p className="font-bold text-white">{student.name}</p>
                    <p className="text-xs text-slate-400">{student.studentId} • {student.department}</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {student.morningStatus === '-' ? (
                      <span className="text-xs text-slate-500 font-medium">Not Marked</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        student.morningStatus === 'Present'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {student.morningStatus === 'Present' && <CheckCircle2 size={14} />}
                        {student.morningStatus === 'Absent' && <XCircle size={14} />}
                        {student.morningStatus}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {student.eveningStatus === '-' ? (
                      <span className="text-xs text-slate-500 font-medium">Not Marked</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        student.eveningStatus === 'Present'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {student.eveningStatus === 'Present' && <CheckCircle2 size={14} />}
                        {student.eveningStatus === 'Absent' && <XCircle size={14} />}
                        {student.eveningStatus}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
