// App.tsx
import React, { useEffect } from 'react';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { setUser, logout } from './src/redux/authSlice';

// 1. Create a wrapper component that handles the Auth Logic
// We need this because `useDispatch` only works INSIDE a ReduxProvider.
const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // This listener fires whenever the user's sign-in state changes
    // It also checks for an existing session when the app launches
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, sync with Redux
        dispatch(setUser({ uid: user.uid, email: user.email }));
      } else {
        // User is signed out
        dispatch(logout());
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [dispatch]);

  return <AppNavigator />;
};

// 2. Main App Component
export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <AppContent /> 
      </PaperProvider>
    </ReduxProvider>
  );
}