import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator } from 'react-native-paper';
import { getFoodProduct } from '../services/foodService';

// Get screen dimensions to center the box
const { width } = Dimensions.get('window');
const SCAN_BOX_SIZE = width * 0.7; // 70% of screen width

export default function ScannerScreen({ navigation }: any) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Loading State (Permissions)
  if (!permission) {
    return <View />;
  }

  // 2. Permission Denied State
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // 3. Handle Barcode Scanned
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    // Prevent multiple scans or scanning while loading
    if (loading || scanned) return;
    
    setLoading(true);
    setScanned(true);

    try {
      // Fetch Data from Open Food Facts
      const productData = await getFoodProduct(data);
      
      // Success Feedback
      // Note: In Day 3, we will navigate to the Results screen here instead of alerting.
      // navigation.navigate('Results', { product: productData });
      alert(`Found: ${productData?.name}\nIngredients: ${productData?.ingredients?.substring(0, 50)}...`);
      
    } catch (error: any) {
      // Error Handling
      alert(`Error: ${error.message}`);
      // Allow user to scan again immediately if it failed
      setScanned(false);
    } finally {
      setLoading(false);
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

        {/* Scan Again Button */}
        {scanned && !loading && (
          <View style={styles.scanAgainButton}>
            <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
          </View>
        )}
      </View>

      {/* 3. Loading Indicator Layer */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Fetching Product Details...</Text>
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
  },
  // Overlay Styles
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Darkens the surrounding area
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
  // Loading Styles
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Decorative corners
  cornerBorderTopLeft: { position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderColor: 'white', borderLeftWidth: 4, borderTopWidth: 4 },
  cornerBorderTopRight: { position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderColor: 'white', borderRightWidth: 4, borderTopWidth: 4 },
  cornerBorderBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderColor: 'white', borderLeftWidth: 4, borderBottomWidth: 4 },
  cornerBorderBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderColor: 'white', borderRightWidth: 4, borderBottomWidth: 4 },
});