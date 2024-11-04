import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SegmentedButtons } from 'react-native-paper';
import { 
  requestNotificationPermissions, 
  scheduleDailyReminder,
  getNotificationPreferences,
  saveNotificationPreferences
} from '@/utils/notifications';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/ThemeContext';
import { ThemedSwitch } from '@/components/ThemedSwitch';
import { ThemedSegmentedButtons } from '@/components/ThemedSegmentedButtons';

export default function SettingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'shift'>('daily');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { theme, setTheme } = useTheme();
  const { theme: themeColor } = useTheme();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await getNotificationPreferences();
    setNotificationsEnabled(prefs.enabled);
    setFrequency(prefs.frequency);
    const prefTime = new Date();
    prefTime.setHours(prefs.time.hour);
    prefTime.setMinutes(prefs.time.minute);
    setTime(prefTime);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      updateNotifications(notificationsEnabled, frequency, selectedTime);
    }
  };

  const updateNotifications = async (enabled: boolean, freq: 'daily' | 'shift', notifTime: Date) => {
    setIsLoading(true);
    try {
      if (enabled) {
        const permissionGranted = await requestNotificationPermissions();
        if (!permissionGranted) {
          Alert.alert(
            "Permission Required",
            "Please enable notifications in your device settings to receive reminders"
          );
          setNotificationsEnabled(false);
          return;
        }

        // Schedule the appropriate reminder type
        if (freq === 'daily') {
          await scheduleDailyReminder({
            enabled,
            frequency: freq,
            time: {
              hour: notifTime.getHours(),
              minute: notifTime.getMinutes(),
            },
          });
        } else {
          // Handle shift reminder scheduling
          // Note: Implement shift reminder scheduling logic here
          // For now, we'll use daily reminder as fallback
          await scheduleDailyReminder({
            enabled,
            frequency: freq,
            time: {
              hour: notifTime.getHours(),
              minute: notifTime.getMinutes(),
            },
          });
        }
      }

      await saveNotificationPreferences({
        enabled,
        frequency: freq,
        time: {
          hour: notifTime.getHours(),
          minute: notifTime.getMinutes(),
        },
      });

      if (enabled) {
        Alert.alert(
          "Success",
          `Reminder notifications have been set up for ${notifTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update notification settings. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.section}>
            <ThemedView style={styles.settingRow}>
              <ThemedView style={styles.settingTextContainer}>
                <ThemedText style={styles.settingTitle} type="title">Theme</ThemedText>
                <ThemedText style={styles.settingDescription} type="default">
                  Choose your preferred appearance
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={[styles.settingRow, styles.themeButtonContainer]}>
              <ThemedSegmentedButtons
                value={theme}
                onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                buttons={[
                  { value: 'light', label: 'Light' },
                  { value: 'system', label: 'System' },
                  { value: 'dark', label: 'Dark' },
                ]}
                style={styles.themeSegment}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedView style={styles.settingRow}>
              <ThemedView style={styles.settingTextContainer}>
                <ThemedText style={styles.settingTitle} type="title">Notifications</ThemedText>
                <ThemedText style={styles.settingDescription} type="default">
                  Get reminded to log your deliveries
                </ThemedText>
              </ThemedView>
              <ThemedSwitch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  setNotificationsEnabled(value);
                  updateNotifications(value, frequency, time);
                }}
              />
            </ThemedView>

            {notificationsEnabled && (
              <>
                <ThemedView style={styles.settingRow}>
                  <ThemedText style={styles.settingLabel}>Frequency</ThemedText>
                  <ThemedSegmentedButtons
                    value={frequency}
                    onValueChange={(value) => {
                      setFrequency(value as 'daily' | 'shift');
                      updateNotifications(notificationsEnabled, value as 'daily' | 'shift', time);
                    }}
                    buttons={[
                      { value: 'daily', label: 'Daily' },
                      { value: 'shift', label: 'Every Shift' },
                    ]}
                    style={styles.segment}
                  />
                </ThemedView>

                <ThemedView style={styles.settingRow}>
                  <ThemedText style={styles.settingLabel}>Time</ThemedText>
                  {Platform.OS === 'ios' ? (
                    <DateTimePicker
                      value={time}
                      mode="time"
                      onChange={handleTimeChange}
                      style={styles.timePicker}
                    />
                  ) : (
                    <Button
                      title={time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      onPress={() => setShowTimePicker(true)}
                      style={styles.timeButton}
                    />
                  )}
                </ThemedView>
              </>
            )}
          </ThemedView>
        </ThemedView>

        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            onChange={handleTimeChange}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '400',
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '400',
  },
  segment: {
    flex: 1,
    maxWidth: 200,
  },
  timePicker: {
    width: 100,
  },
  timeButton: {
    minWidth: 100,
  },
  themeButtonContainer: {
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  themeSegment: {
    width: '100%',
  },
});
