import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { isOnboardingComplete } from '@/services/storage';
import { requestNotificationPermissions, scheduleDailyReminder } from '@/utils/notifications';
import { ThemeProvider } from '@/hooks/ThemeContext';

export default function RootLayout() {
  const showOnboarding = !isOnboardingComplete();

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          <Stack.Screen name="(auth)/onboarding" />
        ) : (
          <Stack.Screen 
            name="(tabs)" 
            options={{
              headerTitle: 'Home'
            }}
          />
        )}
      </Stack>
    </ThemeProvider>
  );
}
