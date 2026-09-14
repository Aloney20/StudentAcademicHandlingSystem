import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDhoE5ahE7wJehQmvsHpKeO-YB4nxFJwqQ",
  authDomain: "test-mark-system.firebaseapp.com",
  projectId: "test-mark-system",
  storageBucket: "test-mark-system.firebasestorage.app",
  messagingSenderId: "165953645762",
  appId: "1:165953645762:web:fbc5e4633af117acf91f5b"
};

export const firebaseReady = true;

let app = null;
export let auth = null;
export let db = null;
export let storage = null;

if (firebaseReady) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export default app;
