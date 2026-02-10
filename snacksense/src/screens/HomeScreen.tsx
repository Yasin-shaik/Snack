// src/screens/HomeScreen.tsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, Card, Title, Paragraph, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useTheme } from 'react-native-paper';
import { RootState } from '../redux/store';

export default function HomeScreen({ navigation }: any) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Title style={styles.greeting}>Hello, Snacker!</Title>
          <Text style={styles.subtext}>{user?.email}</Text>
        </View>
        <MaterialCommunityIcons 
          name="account-circle" 
          size={50} 
          color={theme.colors.primary}
          onPress={() => dispatch(logout())}
        />
      </View>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('Scanner')}>
        <Card.Content style={{ alignItems: 'center', paddingVertical: 40 }}>
          <MaterialCommunityIcons name="barcode-scan" size={80} color={theme.colors.primary} />
          <Title style={{ marginTop: 20, color: theme.colors.onSurface }}>Scan a Product</Title>
          <Paragraph style={{ textAlign: 'center', color: 'gray' }}>
            Point your camera at a food barcode to analyze its health score.
          </Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  greeting: { fontSize: 28, fontWeight: 'bold' },
  subtext: { color: 'gray' },
  card: { borderRadius: 30, elevation: 4, backgroundColor: 'white' , marginBottom: 20},
});