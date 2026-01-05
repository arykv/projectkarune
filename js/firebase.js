// Firebase configuration and initialization using ES modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMo5SFnrqkjj-dw18hFvlEzKIxwyIculY",
  authDomain: "karune-connect.firebaseapp.com",
  projectId: "karune-connect",
  storageBucket: "karune-connect.firebasestorage.app",
  messagingSenderId: "452777576182",
  appId: "1:452777576182:web:d6025d0f586b7c0b0b0ed7",
  measurementId: "G-DM2NQLR0K9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
