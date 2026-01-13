import { useEffect, useState, useCallback } from 'react';
import { AppState, Linking } from 'react-native';
import { Stack, SplashScreen, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider, useToastContext } from '@/contexts/ToastContext';
import { ThemeProvider, useTheme } from '@/hooks/ThemeContext';
import { ToastContainer } from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { isOnboardingComplete, getBirthRecords, getStoredAppVersion, setStoredAppVersion } from '@/services/storage';
import { getPendingWidgetRecord, updateWidgetData, calculateTodayCount } from '@/services/widgetBridge';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { effectiveTheme } = useTheme();
  const router = useRouter();
  const { showToast } = useToastContext();
  const [isReady, setIsReady] = useState(false);

  // Sync widget data on app start and handle pending records
  const syncWidgetAndCheckPending = useCallback(async () => {
    try {
      // Sync widget with current data
      const records = await getBirthRecords();
      const todayCount = calculateTodayCount(records.map(r => ({
        timestamp: r.timestamp ? new Date(r.timestamp) : undefined
      })));
      await updateWidgetData(todayCount, records.length);

      // Check for pending widget record
      const pending = await getPendingWidgetRecord();
      if (pending) {
        // Navigate to quick entry with pre-filled gender
        router.push({
          pathname: '/quick-entry',
          params: { widgetGender: pending.gender }
        });
      }
    } catch (error) {
      console.error('Error syncing widget:', error);
    }
  }, [router]);

  // Handle deep links from widget
  const handleDeepLink = useCallback((url: string | null) => {
    if (!url) return;
    
    try {
      const parsedUrl = new URL(url);
      // Widget uses 'quick-add' path: miraclemeter://quick-add?gender=boy
      if (parsedUrl.pathname === '/quick-add' || parsedUrl.host === 'quick-add') {
        const gender = parsedUrl.searchParams.get('gender');
        if (gender) {
          router.push({
            pathname: '/quick-entry',
            params: { widgetGender: gender }
          });
        } else {
          router.push('/quick-entry');
        }
      }
    } catch {
      // Invalid URL, ignore
    }
  }, [router]);

  // Only check onboarding once on initial mount
  useEffect(() => {
    async function checkInitialOnboarding() {
      const completed = await isOnboardingComplete();
      
      if (!completed) {
        router.replace('/(auth)/onboarding');
      }
      
      setIsReady(true);
    }
    checkInitialOnboarding();
  }, []);

  // Handle app state changes and deep links
  useEffect(() => {
    if (!isReady) return;

    // Initial sync
    syncWidgetAndCheckPending();

    // Handle initial deep link
    Linking.getInitialURL().then(handleDeepLink);

    // Listen for deep links while app is open
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Sync widget when app comes to foreground
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        syncWidgetAndCheckPending();
      }
    });

    return () => {
      linkingSubscription.remove();
      appStateSubscription.remove();
    };
  }, [isReady, syncWidgetAndCheckPending, handleDeepLink]);

  const checkForAppUpdate = useCallback(async () => {
    try {
      const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
      const storedVersion = await getStoredAppVersion();

      if (!storedVersion) {
        await setStoredAppVersion(currentVersion);
        return;
      }

      if (storedVersion !== currentVersion) {
        await setStoredAppVersion(currentVersion);
        showToast('Update complete! Your recap is ready.', 'info');
        router.push('/recap');
      }
    } catch (error) {
      console.error('Error checking app version:', error);
    }
  }, [router, showToast]);

  useEffect(() => {
    if (!isReady) return;
    checkForAppUpdate();
  }, [isReady, checkForAppUpdate]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  const paperTheme = effectiveTheme === 'dark' ? MD3DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)/onboarding" options={{ presentation: 'modal' }} />
          <Stack.Screen name="quick-entry" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="stats" options={{ presentation: 'modal' }} />
          <Stack.Screen name="about" options={{ presentation: 'modal' }} />
          <Stack.Screen name="feedback" options={{ presentation: 'modal' }} />
          <Stack.Screen name="achievements" options={{ presentation: 'modal' }} />
          <Stack.Screen name="recap" options={{ presentation: 'modal' }} />
        </Stack>
        <ToastContainer />
      </ErrorBoundary>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ToastProvider>
          <RootLayoutContent />
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
