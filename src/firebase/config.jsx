import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCxQ-Hd9pMYUXrB9TXhDpB4-liPs2WHH28",
  authDomain: "palae-library1.firebaseapp.com",
  projectId: "palae-library1",
  storageBucket: "palae-library1.firebasestorage.app",
  messagingSenderId: "476242788111",
  appId: "1:476242788111:web:9d9ebba15dade669c8c87a",
  measurementId: "G-P9MGXDNE7S"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
