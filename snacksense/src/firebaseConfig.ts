import { initializeApp, getApp, getApps } from "firebase/app";
// @ts-ignore
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeFirestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MID
};

// 3. Initialize App (Singleton Pattern)
let app;
let auth;
let db;

if (getApps().length === 0) {
  // If no app exists, initialize it
  app = initializeApp(firebaseConfig);

  // Initialize Auth with Persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });

  // Initialize Firestore with Long Polling (Fixes Android Offline issues)
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
  
} else {
  // If app already exists, use the existing instance
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };