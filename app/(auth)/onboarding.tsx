import React from 'react';
import { StyleSheet, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { OnboardingPage } from '@/components/onboarding/OnboardingPage';
import { SetupForm } from '@/components/onboarding/SetupForm';
import { completeOnboarding } from '@/services/storage';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleDone = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <Onboarding
      pages={[
        {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
          image: <OnboardingPage
            title="Welcome to Birth Tracker"
            description="An easy way to track and analyze your delivery statistics"
            icon="baby-carriage"
          />,
        },
        {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
          image: <OnboardingPage
            title="Quick Entry"
            description="Record deliveries in seconds with our streamlined interface"
            icon="pencil-plus"
          />,
        },
        {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
          image: <SetupForm onComplete={handleDone} />,
        },
      ]}
      onDone={handleDone}
      onSkip={handleDone}
      showSkip={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 