// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import scanReducer from './scanSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    scan: scanReducer,
    // We will add reducers here later (e.g., authReducer, scanReducer)
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;