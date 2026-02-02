// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
// 1. Import 'Text' instead of 'Title'
import { TextInput, Button, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/authSlice';
import { registerUser } from '../services/authService';
import { useTheme } from 'react-native-paper';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const theme = useTheme();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await registerUser(email, password);
    setLoading(false);

    if (result.user) {
      dispatch(setUser({ uid: result.user.uid, email: result.user.email }));
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 2. Use Text with a variant prop */}
      <Text variant="headlineMedium" style={styles.title}>
        Create Account
      </Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <Button 
        mode="contained" 
        onPress={handleRegister} 
        loading={loading} 
        style={styles.button}
      >
        Register
      </Button>
      
      <Button onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#fff' 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 20,
    fontWeight: 'bold',
    // fontSize is now handled by the 'variant' prop, 
    // but you can keep it here if you want to override it.
  },
  input: { 
    marginBottom: 10,
    backgroundColor: '#fff' 
  },
  button: { 
    marginTop: 10, 
    marginBottom: 10,
    paddingVertical: 6
  },
});