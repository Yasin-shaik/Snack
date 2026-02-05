import React, { useEffect } from 'react';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { setUser, logout } from './src/redux/authSlice';
import { appTheme } from './src/theme/appTheme';
import { getUserProfile } from './src/services/authService';
import { updateUserProfile } from './src/redux/authSlice';

const AppContent = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => { 
      if (user) {
        store.dispatch(setUser({ uid: user.uid, email: user.email }));
        const profile = await getUserProfile(user.uid);
        if (profile) {
          store.dispatch(updateUserProfile(profile));
        }
      } else {
        store.dispatch(setUser(null));
      }
    });
    return unsubscribe;
  }, []);
  return <AppNavigator />;
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={appTheme}>
        <AppContent /> 
      </PaperProvider>
    </ReduxProvider>
  );
}