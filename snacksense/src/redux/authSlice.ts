// src/redux/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. Define the Profile Interface
export interface UserProfile {
  activityLevel: 'Sedentary' | 'Moderate' | 'Active';
  waterGoal: string; // Keeping as string for TextInput handling
  stepGoal: string;
  healthGoal: 'Weight Loss' | 'Muscle Gain' | 'Maintenance';
}

interface AuthState {
  user: any | null;
  userProfile: UserProfile | null; // <--- Add this
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  userProfile: null, // <--- Add this
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    // 2. Add the Update Action
    updateUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.userProfile = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.userProfile = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;