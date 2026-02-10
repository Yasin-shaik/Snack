// src/screens/ScannerScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Services & Redux
import { getFoodProduct } from '../services/foodService';
import { analyzeFoodProduct } from '../services/aiService';
import { startScan, scanSuccess, analysisSuccess, scanFailure } from '../redux/scanSlice';
import { RootState } from '../redux/store';

const { width } = Dimensions.get('window');
const SCAN_BOX_SIZE = width * 0.7; 

export default function ScannerScreen({ navigation }: any) {
  const theme = useTheme();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  
  // Local states
  const [scanned, setScanned] = useState(false); 
  const [isSuccessAnim, setIsSuccessAnim] = useState(false); // Controls Green Checkmark

  // Redux hooks
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.scan.loading);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  // 1. Permission Loading
  if (!permission) {
    return <View style={styles.container} />;
  }

  // 2. Permission Denied
  if (!permission.granted) {
    return (
      <View style={[styles.container, { alignItems: 'center', backgroundColor: 'black' }]}>
        <Text style={styles.message}>We need camera permission to scan barcodes.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // 3. Main Logic
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    // Prevent multiple scans
    if (loading || scanned) return;
    
    setScanned(true); // Freeze camera
    dispatch(startScan()); // Show "Analyzing..." spinner (Redux loading=true)

    try {
      // A. Fetch Basic Data (Open Food Facts)
      const productData = await getFoodProduct(data);
      
      if (!productData) {
        throw new Error("Product not found in database.");
      }

      // B. Show Success Animation (Overlays the spinner)
      setIsSuccessAnim(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec
      setIsSuccessAnim(false); // Hide checkmark, reveal "Analyzing..." spinner

      dispatch(scanSuccess(productData)); // Save product to Redux

      // C. Analyze with AI (Gemini) - Passing User Profile
      const analysis = await analyzeFoodProduct(productData, userProfile);
      
      dispatch(analysisSuccess(analysis)); // Save analysis to Redux
      
      // D. Navigate
      setScanned(false); // Reset for next time
      navigation.navigate('Results'); 

    } catch (error: any) {
      console.error("Scan/Analysis Error:", error);
      dispatch(scanFailure(error.message || "Unknown error occurred"));
      alert(`Error: ${error.message}`);
      
      // Reset states on failure
      setScanned(false);
      setIsSuccessAnim(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Camera Layer */}
      <CameraView 
        style={StyleSheet.absoluteFill} 
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"], 
        }}
      />

      {/* 2. Visual Overlay Layer (Scan Frame) */}
      <View style={[styles.overlay, StyleSheet.absoluteFill]}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            {/* Green Corners */}
            <View style={styles.cornerBorderTopLeft} />
            <View style={styles.cornerBorderTopRight} />
            <View style={styles.cornerBorderBottomLeft} />
            <View style={styles.cornerBorderBottomRight} />
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}></View>

        {/* Scan Again Button (Only if scanned but failed, not while loading) */}
        {scanned && !loading && !isSuccessAnim && (
          <View style={styles.scanAgainButton}>
            <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
          </View>
        )}
      </View>

      {/* 3. Loading Indicator Overlay (Analyzing...) */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4caf50" style={{ marginBottom: 20 }} />
            <Text style={styles.loadingTitle}>Analyzing...</Text>
            <Text style={styles.loadingSubtitle}>
              Consulting the AI Nutritionist...
            </Text>
            <Text style={styles.loadingTip}>
              (Checking for allergens & sustainability)
            </Text>
          </View>
        </View>
      )}

      {/* 4. Success Overlay (Product Found!) - Higher zIndex */}
      {isSuccessAnim && (
        <View style={styles.successOverlay}>
          <View style={styles.successCircle}>
            <MaterialCommunityIcons name="check" size={80} color="white" />
          </View>
          <Text style={styles.successText}>Product Found!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    marginBottom: 10,
  },
  
  // --- Overlay Styles ---
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Darkens area outside scan box
  },
  middleContainer: {
    flexDirection: 'row',
    height: SCAN_BOX_SIZE,
  },
  focusedContainer: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  
  // --- Green Corners ---
  cornerBorderTopLeft: { 
    position: 'absolute', top: 0, left: 0, width: 30, height: 30,
    borderColor: '#4CAF50', 
    borderLeftWidth: 5, borderTopWidth: 5,
    borderTopLeftRadius: 10 
  },
  cornerBorderTopRight: { 
    position: 'absolute', top: 0, right: 0, width: 30, height: 30, 
    borderColor: '#4CAF50',
    borderRightWidth: 5, borderTopWidth: 5,
    borderTopRightRadius: 10
  },
  cornerBorderBottomLeft: { 
    position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, 
    borderColor: '#4CAF50',
    borderLeftWidth: 5, borderBottomWidth: 5,
    borderBottomLeftRadius: 10
  },
  cornerBorderBottomRight: { 
    position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, 
    borderColor: '#4CAF50',
    borderRightWidth: 5, borderBottomWidth: 5,
    borderBottomRightRadius: 10
  },

  // --- Loading Overlay ---
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', 
    zIndex: 20,
  },
  loadingBox: {
    backgroundColor: 'rgba(0,0,0,0.85)', 
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
  },
  loadingTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingSubtitle: {
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 5,
    fontSize: 16,
  },
  loadingTip: {
    color: '#bdbdbd',
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },

  // --- Success Overlay ---
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30, // Shows ON TOP of loading overlay
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});