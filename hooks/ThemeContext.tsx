import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const systemColorScheme = useNativeColorScheme();

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem('themePreference').then((savedTheme) => {
      if (savedTheme) {
        setThemeState(savedTheme as ThemePreference);
      }
    });
  }, []);

  const setTheme = async (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('themePreference', newTheme);
  };

  const effectiveTheme = theme === 'system' 
    ? (systemColorScheme ?? 'light')
    : theme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 