// src/services/authService.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Import Firestore
import { auth } from '../firebaseConfig'; // Ensure you have exported 'db' or initialize here
import { UserProfile } from '../redux/authSlice';

const db = getFirestore(); 

export const saveUserProfile = async (uid: string, profile: UserProfile) => {
  try {
    const userRef = doc(db, "users", uid);
    // Merge true allows updating specific fields without overwriting everything
    await setDoc(userRef, { profile }, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};