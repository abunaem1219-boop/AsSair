import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyBVHikQbZCSC11O7IxjGaIftsa9GAnbdzo",
  authDomain: "as-sair.firebaseapp.com",
  databaseURL: "https://as-sair-default-rtdb.firebaseio.com",
  projectId: "as-sair",
  storageBucket: "as-sair.firebasestorage.app",
  messagingSenderId: "431688768914",
  appId: "1:431688768914:web:553c12856bcb9c33d9f54b"
};

// Permanent Super Administrator UID specified in the system brief
export const INITIAL_SUPER_ADMIN_UID = "UccjJ23kFie3YyUMOiihiPrjO6S2";

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase Auth & Realtime Database
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
