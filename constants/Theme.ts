import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const theme = {
  colors: {
    background: {
      primary: '#000000',
      secondary: '#111111',
      tertiary: '#191919',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.4)',
    },
    accent: {
      primary: '#14B8A6',
      secondary: '#5EEAD4',
      hover: '#0F766E',
    },
    success: '#2ECC71',
    warning: '#F1C40F',
    error: '#E74C3C',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  
  spacing: {
    '2': 2,
    '4': 4,
    '8': 8,
    '12': 12,
    '16': 16,
    '20': 20,
    '24': 24,
    '32': 32,
    '40': 40,
    '48': 48,
  },

  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
};

export type Theme = typeof theme; 