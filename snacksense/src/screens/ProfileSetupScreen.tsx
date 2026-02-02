// src/screens/ProfileSetupScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, RadioButton, Chip, Title, ProgressBar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, UserProfile } from '../redux/authSlice';
import { saveUserProfile } from '../services/authService';
import { RootState } from '../redux/store';
import { useTheme } from 'react-native-paper';

export default function ProfileSetupScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);

  // Form State
  const [activityLevel, setActivityLevel] = useState<'Sedentary' | 'Moderate' | 'Active'>('Moderate');
  const [waterGoal, setWaterGoal] = useState('2.5');
  const [stepGoal, setStepGoal] = useState('10000');
  const [healthGoal, setHealthGoal] = useState<'Weight Loss' | 'Muscle Gain' | 'Maintenance'>('Maintenance');

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    const profileData: UserProfile = {
      activityLevel,
      waterGoal,
      stepGoal,
      healthGoal,
    };

    // 1. Save to Redux (Global State)
    dispatch(updateUserProfile(profileData));

    // 2. Save to Firestore (Database)
    const result = await saveUserProfile(user.uid, profileData);

    setLoading(false);

    if (result.success) {
      // Navigate to Home only after setting up profile
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      Alert.alert("Error", "Could not save profile. Please try again.");
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Title style={styles.title}>Tell us about you</Title>
        <Text style={styles.subtitle}>Help the AI customize your food analysis.</Text>
      </View>

      {/* 1. Activity Level */}
      <View style={styles.section}>
        <Text style={styles.label}>Activity Level</Text>
        <RadioButton.Group onValueChange={value => setActivityLevel(value as any)} value={activityLevel}>
          <View style={styles.radioRow}>
            <RadioButton value="Sedentary" color="#4CAF50" />
            <Text>Sedentary (Office Job)</Text>
          </View>
          <View style={styles.radioRow}>
            <RadioButton value="Moderate" color="#4CAF50" />
            <Text>Moderate (Light Exercise)</Text>
          </View>
          <View style={styles.radioRow}>
            <RadioButton value="Active" color="#4CAF50" />
            <Text>Active (Daily Exercise)</Text>
          </View>
        </RadioButton.Group>
      </View>

      {/* 2. Health Goal */}
      <View style={styles.section}>
        <Text style={styles.label}>Health Goal</Text>
        <View style={styles.chipContainer}>
          {['Weight Loss', 'Maintenance', 'Muscle Gain'].map((goal) => (
            <Chip 
              key={goal} 
              selected={healthGoal === goal} 
              onPress={() => setHealthGoal(goal as any)}
              style={[styles.chip, healthGoal === goal && styles.selectedChip]}
              selectedColor={healthGoal === goal ? 'white' : 'black'}
            >
              {goal}
            </Chip>
          ))}
        </View>
      </View>

      {/* 3. Daily Targets */}
      <View style={styles.section}>
        <Text style={styles.label}>Daily Targets</Text>
        <TextInput
          label="Water Goal (Liters)"
          value={waterGoal}
          onChangeText={setWaterGoal}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          activeOutlineColor="#4CAF50"
        />
        <TextInput
          label="Daily Steps Goal"
          value={stepGoal}
          onChangeText={setStepGoal}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          activeOutlineColor="#4CAF50"
        />
      </View>

      <Button 
        mode="contained" 
        onPress={handleSave} 
        loading={loading}
        style={styles.button}
        labelStyle={{ fontSize: 18, paddingVertical: 5 }}
      >
        Complete Setup
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  header: { marginBottom: 30, marginTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: 'gray', marginTop: 5 },
  section: { marginBottom: 25, backgroundColor: 'white', padding: 20, borderRadius: 15, elevation: 2 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#4CAF50' },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#e0e0e0' },
  selectedChip: { backgroundColor: '#4CAF50' },
  input: { marginBottom: 15, backgroundColor: 'white' },
  button: { marginTop: 10, backgroundColor: '#4CAF50', borderRadius: 10 },
});