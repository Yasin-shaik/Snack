import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ScannerScreen from "../screens/ScannerScreen";
import ResultsScreen from "../screens/ResultsScreen";
import HomeScreen from "../screens/HomeScreen";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          !userProfile ? (
            <Stack.Screen
              name="ProfileSetup"
              component={ProfileSetupScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Results" component={ResultsScreen} />
              <Stack.Screen name="EditProfile" component={ProfileSetupScreen} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
