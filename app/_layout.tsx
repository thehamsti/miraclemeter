import { useEffect, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
// import { isOnboardingComplete } from '@/services/storage'; // No longer needed for routing here
import { requestNotificationPermissions, scheduleDailyReminder } from '@/utils/notifications'; // Keep for now, may be used elsewhere or for future re-enablement
import { ThemeProvider } from '@/hooks/ThemeContext';

// Prevent the splash screen from auto-hiding before app readiness
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const showOnboarding = !isOnboardingComplete(); // Temporarily removed

  useEffect(() => {
    const hideSplash = async () => {
      // Add a small delay. This can sometimes help if there's a race condition
      // with other UI elements (like modals or alerts) appearing too quickly.
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      await SplashScreen.hideAsync(); // Hide the splash screen
    };

    hideSplash();
  }, []); // Empty dependency array ensures this runs once after the initial render

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* {showOnboarding ? (
          <Stack.Screen name='(auth)/onboarding' />
        ) : ( */} 
          <Stack.Screen 
            name="(tabs)" 
            options={{
              headerTitle: 'Home'
            }}
          />
        {/* )} */}
      </Stack>
    </ThemeProvider>
  );
}
