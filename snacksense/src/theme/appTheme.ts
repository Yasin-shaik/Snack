import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { colors } from './colors';

export const appTheme = {
  ...DefaultTheme,
  roundness: 4,
  colors: {
    ...DefaultTheme.colors,
    
    primary: '#2E7D32',
    onPrimary: '#FFFFFF',
    primaryContainer: '#C8E6C9',
    onPrimaryContainer: '#1B5E20',

    secondary: '#4CAF50',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8F5E9',
    onSecondaryContainer: '#1B5E20',

    background: '#F1F8E9',
    surface: '#FFFFFF',
    onSurface: '#3E4E42',
    
    error: '#D32F2F',
    outline: '#4CAF50',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F5F5F5',
      level3: '#E0E0E0',
      level4: '#E0E0E0',
      level5: '#E0E0E0',
    },
  },
};