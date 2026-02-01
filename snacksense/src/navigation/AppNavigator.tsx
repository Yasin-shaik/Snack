// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ScannerScreen from "../screens/ScannerScreen";
import ResultsScreen from "../screens/ResultsScreen";
import HomeScreen from "../screens/HomeScreen";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

// Import Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen"; // Ensure you created this
import { View, Text, Button } from "react-native";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

const Stack = createStackNavigator();

export default function AppNavigator() {
  // Select isAuthenticated from Redux
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Scanner"
              component={ScannerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Results" component={ResultsScreen} />
          </>
        ) : (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
