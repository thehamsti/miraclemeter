import { Stack, router } from 'expo-router';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { resetStorage, saveBirthRecord, setHomeRecapDismissed } from '@/services/storage';
import type { BirthRecord } from '@/types';

const recapYear = new Date().getFullYear() - 1;

function generateTestDataForYear(year: number): BirthRecord[] {
  const records: BirthRecord[] = [];
  const genders: Array<'boy' | 'girl' | 'angel'> = ['boy', 'girl', 'angel'];
  const deliveryTypes: Array<'vaginal' | 'c-section'> = ['vaginal', 'c-section'];

  // Generate 15-25 random records for the year
  const recordCount = Math.floor(Math.random() * 11) + 15;

  for (let i = 0; i < recordCount; i++) {
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);

    // 80% single births, 15% twins, 5% triplets
    const birthRoll = Math.random();
    const babyCount = birthRoll < 0.8 ? 1 : birthRoll < 0.95 ? 2 : 3;

    const babies = Array.from({ length: babyCount }, (_, index) => ({
      gender: genders[Math.floor(Math.random() * (Math.random() < 0.95 ? 2 : 3))] as 'boy' | 'girl' | 'angel',
      birthOrder: index + 1,
    }));

    records.push({
      id: `test-${year}-${i}-${Date.now()}`,
      timestamp: new Date(year, month, day, hour, minute),
      deliveryType: deliveryTypes[Math.floor(Math.random() * 2)],
      eventType: 'delivery',
      babies,
      notes: '',
    });
  }

  return records;
}

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

  const handleResetRecapBanner = async () => {
    try {
      await setHomeRecapDismissed(recapYear, false);
      Alert.alert('Success', `Recap banner for ${recapYear} has been reset. Go back to the home screen to see it.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to reset recap banner.');
    }
  };

  const handleGenerateTestData = () => {
    Alert.alert(
      'Generate Test Data',
      `This will generate 15-25 random birth records for ${recapYear}. Existing records will NOT be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              const records = generateTestDataForYear(recapYear);
              for (const record of records) {
                await saveBirthRecord(record);
              }
              // Also reset the banner so it shows
              await setHomeRecapDismissed(recapYear, false);
              Alert.alert('Success', `Generated ${records.length} test records for ${recapYear}. Go back to the home screen to see the recap banner.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to generate test data.');
              console.error('Error generating test data:', error);
            }
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
        <ScrollView>
          <ThemedView style={styles.content}>
            <ThemedText style={styles.warning}>
              ⚠️ Developer Options
            </ThemedText>
            <ThemedText style={styles.description}>
              These options are for testing purposes only.
            </ThemedText>

            <ThemedText style={styles.sectionTitle}>Recap Testing</ThemedText>
            <Button
              title={`Generate ${recapYear} Test Data`}
              onPress={handleGenerateTestData}
              style={styles.button}
            />
            <Button
              title="Reset Recap Banner"
              onPress={handleResetRecapBanner}
              style={styles.button}
            />

            <ThemedText style={styles.sectionTitle}>Danger Zone</ThemedText>
            <Button
              title="Clear All AsyncStorage"
              onPress={handleClearStorage}
              style={styles.dangerButton}
            />

            <Button
              title="Back to About"
              onPress={() => router.back()}
              style={styles.button}
              variant="secondary"
            />
          </ThemedView>
        </ScrollView>
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
    gap: 12,
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
  dangerButton: {
    marginTop: 8,
  },
});
