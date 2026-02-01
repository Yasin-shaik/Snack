import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

// Services & Redux
import { getFoodProduct } from '../services/foodService';
import { analyzeFoodProduct } from '../services/aiService';
import { startScan, scanSuccess, analysisSuccess, scanFailure } from '../redux/scanSlice';
import { RootState } from '../redux/store';

// Screen Dimensions for the scan box
const { width } = Dimensions.get('window');
const SCAN_BOX_SIZE = width * 0.7; 

export default function ScannerScreen({ navigation }: any) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false); // Local state to freeze camera

  const dispatch = useDispatch();
  // Read loading state from Redux
  const loading = useSelector((state: RootState) => state.scan.loading);

  // 1. Permission Loading State
  if (!permission) {
    return <View style={styles.container} />;
  }

  // 2. Permission Denied State
  if (!permission.granted) {
    return (
      <View style={[styles.container, { alignItems: 'center', backgroundColor: 'black' }]}>
        <Text style={styles.message}>We need camera permission to scan barcodes.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // 3. Main Logic: Handle Barcode Scan
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    // Prevent double-scanning
    if (loading || scanned) return;
    
    setScanned(true); // Freeze local camera state
    dispatch(startScan()); // Set Redux loading = true

    try {
      // Step A: Fetch Basic Data (Open Food Facts)
      const productData = await getFoodProduct(data);

      if (!productData) {
        throw new Error("Product found, but data is incomplete.");
      }
      
      dispatch(scanSuccess(productData)); // Save to Redux

      // Step B: Analyze with AI (Gemini)
      // Note: We do this here so the result is ready when we navigate
      const analysis = await analyzeFoodProduct(productData);
      
      dispatch(analysisSuccess(analysis)); // Save analysis to Redux
      
      // Step C: Navigate
      setScanned(false); // Unfreeze for next time (though we navigate away)
      navigation.navigate('Results'); 

    } catch (error: any) {
      console.error("Scan/Analysis Error:", error);
      dispatch(scanFailure(error.message || "Unknown error occurred"));
      alert(`Error: ${error.message}`);
      
      // Reset state so user can try again
      setScanned(false);
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
            <View style={styles.cornerBorderTopLeft} />
            <View style={styles.cornerBorderTopRight} />
            <View style={styles.cornerBorderBottomLeft} />
            <View style={styles.cornerBorderBottomRight} />
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}></View>

        {/* Scan Again Button (Only if scanned but failed/reset, not while loading) */}
        {scanned && !loading && (
          <View style={styles.scanAgainButton}>
            <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
          </View>
        )}
      </View>

      {/* 3. Loading Indicator Overlay (UX Improvement) */}
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
  
  // --- Decorative Corners ---
  cornerBorderTopLeft: { position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderColor: 'white', borderLeftWidth: 4, borderTopWidth: 4 },
  cornerBorderTopRight: { position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderColor: 'white', borderRightWidth: 4, borderTopWidth: 4 },
  cornerBorderBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderColor: 'white', borderLeftWidth: 4, borderBottomWidth: 4 },
  cornerBorderBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderColor: 'white', borderRightWidth: 4, borderBottomWidth: 4 },

  // --- Loading Overlay Styles ---
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
});