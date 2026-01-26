import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBVUKjv05kbjKpFeUKBycmyPDoIsG-OAGw",
  authDomain: "snacksense-1aa44.firebaseapp.com",
  projectId: "snacksense-1aa44",
  storageBucket: "snacksense-1aa44.firebasestorage.app",
  messagingSenderId: "468177778550",
  appId: "1:468177778550:web:ea41832494a6b9275e6c57",
  measurementId: "G-TBG1EXGR4W",
};

const app = initializeApp(firebaseConfig);

// 2. Initialize Auth with persistence enabled
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
