// src/utils/firebase.js
// Replace the firebaseConfig values with your own from:
// Firebase Console → Project Settings → Your apps → Web app → SDK setup

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCxkRaFKTIxfNi7mk0PGkvmIcAnDCzMzNE",
  authDomain: "jp-bridge.firebaseapp.com",
  projectId: "jp-bridge",
  storageBucket: "jp-bridge.firebasestorage.app",
  messagingSenderId: "1007936529673",
  appId: "1:1007936529673:web:898a4542a6cfbe62a65fd8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
