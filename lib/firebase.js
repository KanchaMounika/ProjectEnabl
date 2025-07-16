// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7jTDmFI5Y8NVZBDK9N498qUrLQ6kDhTM",
  authDomain: "enabl-9222d.firebaseapp.com",
  projectId: "enabl-9222d",
  storageBucket: "enabl-9222d.firebasestorage.app",
  messagingSenderId: "305594171532",
  appId: "1:305594171532:web:363b8d5331152bfb45bba9",
  measurementId: "G-LX6DG4PPM5"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Lazy-load analytics only if in browser environment

export { db };


