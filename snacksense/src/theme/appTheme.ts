import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { colors } from './colors';

export const appTheme = {
  ...DefaultTheme,
  // We override the default "colors" object
  colors: {
    ...DefaultTheme.colors,
    
    // 1. Primary Actions (Buttons, Active states)
    primary: colors.primary,
    onPrimary: colors.white, // Text color on top of primary button
    primaryContainer: '#C8E6C9', // Lighter green background for selected items
    onPrimaryContainer: '#1B5E20', // Text on top of that light container

    // 2. Secondary Actions (FABs, Chips)
    secondary: colors.secondary,
    onSecondary: colors.white,
    secondaryContainer: '#E8F5E9',
    onSecondaryContainer: '#1B5E20',
    
    // 3. Backgrounds & Surface
    background: colors.background, // Sets the app background to Mint White
    surface: colors.surface,       // Cards remain white
    onSurface: colors.textBody,    // Default text color
    
    // 4. Outlines & Borders
    outline: colors.secondary, 
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
    },
  },
};