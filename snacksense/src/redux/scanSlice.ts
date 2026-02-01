// src/redux/scanSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FoodProduct } from '../services/foodService';
import { AnalysisResult } from '../types/AnalysisResult'; // Ensure this type exists from Day 3 Morning

interface ScanState {
  scannedProduct: FoodProduct | null;
  analysisResult: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: ScanState = {
  scannedProduct: null,
  analysisResult: null,
  loading: false,
  error: null,
};

const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    startScan: (state) => {
      state.loading = true;
      state.error = null;
    },
    scanSuccess: (state, action: PayloadAction<FoodProduct>) => {
      state.scannedProduct = action.payload;
      // We keep loading true because we usually analyze immediately after
    },
    analysisSuccess: (state, action: PayloadAction<AnalysisResult>) => {
      state.analysisResult = action.payload;
      state.loading = false;
    },
    scanFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetScan: (state) => {
      state.scannedProduct = null;
      state.analysisResult = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { startScan, scanSuccess, analysisSuccess, scanFailure, resetScan } = scanSlice.actions;
export default scanSlice.reducer;