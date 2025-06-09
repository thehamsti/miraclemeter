/**
 * Modern, professional color palette for a healthcare tracking app
 * Emphasizes trust, clarity, and ease of use
 */

// Primary brand colors - Professional medical theme
const primaryLight = '#643872'; // Deep purple
const primaryDark = '#9B7EBD'; // Lighter purple for dark mode

// Base colors
const white = '#FFFFFF';
const black = '#000000';

// Gray scale
const gray50 = '#FAFBFC';
const gray100 = '#F3F4F6';
const gray200 = '#E5E7EB';
const gray300 = '#D1D5DB';
const gray400 = '#9CA3AF';
const gray500 = '#6B7280';
const gray600 = '#4B5563';
const gray700 = '#374151';
const gray800 = '#1F2937';
const gray900 = '#111827';

// Dark mode backgrounds - Refined dark theme
const dark1 = '#0F172A'; // Slate 900
const dark2 = '#1E293B'; // Slate 800
const dark3 = '#334155'; // Slate 700

// Semantic colors - Enhanced contrast
const success = '#10B981';
const successLight = '#D1FAE5';
const error = '#DC2626';
const errorLight = '#FEE2E2';
const warning = '#F59E0B';
const warningLight = '#FEF3C7';
const info = '#643872';
const infoLight = '#DBEAFE';

// Gender colors - Softer, more professional
const maleColor = '#2563EB';
const femaleColor = '#DB2777';

export const Colors = {
  light: {
    // Text - Enhanced readability
    text: gray900,
    textSecondary: gray600,
    textTertiary: gray500,
    
    // Backgrounds
    background: gray50,
    surface: white,
    surfaceElevated: white,
    
    // Brand
    tint: primaryLight,
    primary: primaryLight,
    primaryLight: '#F3F0F7',
    
    // Navigation
    tabIconDefault: gray400,
    tabIconSelected: primaryLight,
    
    // Borders
    border: gray200,
    borderLight: gray100,
    
    // Buttons
    primaryButton: primaryLight,
    primaryButtonText: white,
    secondaryButton: gray100,
    secondaryButtonText: gray700,
    
    // Semantic
    error,
    errorLight,
    success,
    successLight,
    warning,
    warningLight,
    info,
    infoLight,
    
    // Gender
    male: maleColor,
    female: femaleColor,
    
    // Components
    segmentedButtonActive: primaryLight,
    segmentedButtonInactive: gray200,
    switchTrackActive: primaryLight,
    switchTrackInactive: gray300,
    switchThumbActive: white,
    switchThumbInactive: white,
    
    // Shadows
    shadowColor: black,
    shadowOpacity: 0.08,
  },
  dark: {
    // Text
    text: '#F9FAFB',
    textSecondary: gray300,
    textTertiary: gray400,
    
    // Backgrounds
    background: dark1,
    surface: dark2,
    surfaceElevated: dark3,
    
    // Brand
    tint: primaryDark,
    primary: primaryDark,
    primaryLight: '#2D1B3D',
    
    // Navigation
    tabIconDefault: gray500,
    tabIconSelected: primaryDark,
    
    // Borders
    border: gray700,
    borderLight: gray800,
    
    // Buttons
    primaryButton: primaryDark,
    primaryButtonText: white,
    secondaryButton: gray700,
    secondaryButtonText: gray100,
    
    // Semantic
    error: '#F87171',
    errorLight: '#7F1D1D',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    info: '#9B7EBD',
    infoLight: '#2D1B3D',
    
    // Gender
    male: '#60A5FA',
    female: '#F472B6',
    
    // Components
    segmentedButtonActive: primaryDark,
    segmentedButtonInactive: gray700,
    switchTrackActive: primaryDark,
    switchTrackInactive: gray600,
    switchThumbActive: white,
    switchThumbInactive: gray300,
    
    // Shadows
    shadowColor: black,
    shadowOpacity: 0.3,
  },
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius scale
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Typography scale - Enhanced for better readability
export const Typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  
  // Line heights - Improved for better readability
  lineHeights: {
    xs: 18,
    sm: 22,
    base: 26,
    lg: 30,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
    '4xl': 48,
  },
  
  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Letter spacing for better readability
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
  },
};

// Shadow presets
export const Shadows = {
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 16,
  },
};