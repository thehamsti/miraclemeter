import { useState } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

const DEV_TAP_COUNT = 5;
const DEV_TAP_TIMEOUT = 3000; // 3 seconds to complete the taps

// Module-level state to persist across remounts
let devTapCount = 0;
let devTapTimeout: ReturnType<typeof setTimeout> | null = null;

export default function AboutScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const [tapCount, setTapCount] = useState(devTapCount);

  const handleStarTap = () => {
    if (devTapTimeout) {
      clearTimeout(devTapTimeout);
      devTapTimeout = null;
    }

    devTapCount += 1;
    setTapCount(devTapCount);
    console.log('Tap count:', devTapCount);
    
    if (devTapCount >= DEV_TAP_COUNT) {
      devTapCount = 0;
      setTapCount(0);
      router.push('/dev-menu');
      return;
    }

    devTapTimeout = setTimeout(() => {
      devTapCount = 0;
      setTapCount(0);
    }, DEV_TAP_TIMEOUT);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'About',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.description}>
            Built by nurses, for nurses. MiracleMeter was created with love to help L&D professionals track every birth they witness and celebrate their career milestones — all while keeping patient privacy first.
          </ThemedText>
          <TouchableOpacity 
            onPress={handleStarTap} 
            style={styles.starButton}
            activeOpacity={0.5}
          >
            <ThemedText style={styles.star}>✨</ThemedText>
            {tapCount > 0 && <ThemedText style={styles.tapHint}>{tapCount}/{DEV_TAP_COUNT}</ThemedText>}
          </TouchableOpacity>
          <Button 
            title="Visit MiracleMeter.app 🌐" 
            onPress={() => Linking.openURL('https://miraclemeter.app')}
            style={styles.button}
          />
          <Button 
            title="Send Feedback 💬" 
            onPress={() => Linking.openURL('mailto:john@hamsti.co')}
            style={styles.button}
          />
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  description: {
    lineHeight: 24,
    textAlign: 'center',
  },
  starButton: {
    padding: 16,
    marginVertical: 8,
  },
  star: {
    fontSize: 32,
  },
  tapHint: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
}); 