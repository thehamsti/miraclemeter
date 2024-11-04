import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { isOnboardingComplete } from '../services/storage';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const completed = await isOnboardingComplete();
    setShowOnboarding(!completed);
    setIsLoading(false);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {showOnboarding ? (
        <Stack.Screen name="(auth)/onboarding" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
