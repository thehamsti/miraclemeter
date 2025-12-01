import { Stack, router } from 'expo-router';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { resetStorage } from '@/services/storage';

export default function DevMenuScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleClearStorage = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all app data including birth records, preferences, and onboarding status. The app will restart to the onboarding flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await resetStorage();
            Alert.alert('Done', 'Storage cleared. Please restart the app.', [
              { text: 'OK' }
            ]);
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Dev Menu',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.warning}>
            ⚠️ Developer Options
          </ThemedText>
          <ThemedText style={styles.description}>
            These options are for testing purposes only.
          </ThemedText>
          <Button 
            title="Clear All AsyncStorage" 
            onPress={handleClearStorage}
            style={styles.button}
          />
          <Button 
            title="Back to About" 
            onPress={() => router.back()}
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
  },
  warning: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginTop: 20,
  },
});
