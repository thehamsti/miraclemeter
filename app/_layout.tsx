import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { ThemeProvider } from '@/hooks/ThemeContext';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const paperTheme = colorScheme === 'dark' ? MD3DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)/onboarding" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="stats" options={{ presentation: 'modal' }} />
          <Stack.Screen name="about" options={{ presentation: 'modal' }} />
          <Stack.Screen name="feedback" options={{ presentation: 'modal' }} />
          <Stack.Screen name="achievements" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
