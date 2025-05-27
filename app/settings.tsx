import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Alert, Platform, ScrollView, View } from 'react-native';
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
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const borderLightColor = useThemeColor({}, 'borderLight');
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
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette-outline" size={24} color={tintColor} />
              <ThemedText style={styles.sectionTitle} type="subtitle">
                Appearance
              </ThemedText>
            </View>
            <View style={[styles.settingItem, { borderBottomColor: borderLightColor }]}>
              <View style={styles.settingTextContainer}>
                <ThemedText 
                  style={styles.settingTitle} 
                  numberOfLines={1}
                >
                  Theme
                </ThemedText>
                <ThemedText 
                  style={[styles.settingDescription, { color: textSecondaryColor }]}
                  numberOfLines={2}
                >
                  Choose your preferred appearance
                </ThemedText>
              </View>
            </View>
            <View style={[styles.settingItem, styles.themeButtonContainer]}>
              <ThemedSegmentedButtons
                value={theme}
                onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                buttons={[
                  { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
                  { value: 'system', label: 'Auto', icon: 'theme-light-dark' },
                  { value: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
                ]}
                style={styles.themeSegment}
              />
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: surfaceColor, marginTop: Spacing.md }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications-outline" size={24} color={tintColor} />
              <ThemedText style={styles.sectionTitle} type="subtitle">
                Notifications
              </ThemedText>
            </View>
            <View style={[styles.settingItem, { borderBottomColor: borderLightColor }]}>
              <View style={styles.settingTextContainer}>
                <ThemedText 
                  style={styles.settingTitle}
                  numberOfLines={1}
                >
                  Daily Reminders
                </ThemedText>
                <ThemedText 
                  style={[styles.settingDescription, { color: textSecondaryColor }]}
                  numberOfLines={2}
                >
                  Get reminded to log your deliveries
                </ThemedText>
              </View>
              <ThemedSwitch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  setNotificationsEnabled(value);
                  updateNotifications(value, frequency, time);
                }}
              />
            </View>

            {notificationsEnabled && (
              <>
                <View style={[styles.settingItem, { borderBottomColor: borderLightColor }]}>
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
                </View>

                <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                  <ThemedText style={styles.settingLabel}>Reminder Time</ThemedText>
                  {Platform.OS === 'ios' ? (
                    <DateTimePicker
                      value={time}
                      mode="time"
                      onChange={handleTimeChange}
                      style={styles.timePicker}
                      themeVariant={theme === 'dark' ? 'dark' : 'light'}
                    />
                  ) : (
                    <Button
                      title={time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      onPress={() => setShowTimePicker(true)}
                      variant="tertiary"
                      size="small"
                      style={styles.timeButton}
                      icon={<Ionicons name="time-outline" size={16} color={textColor} />}
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>

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
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 60,
    borderBottomWidth: 0.5,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: Typography.sm,
    lineHeight: Typography.lineHeights.sm,
  },
  settingLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  segment: {
    flex: 1,
    maxWidth: 180,
  },
  timePicker: {
    width: 100,
  },
  timeButton: {
    minWidth: 120,
  },
  themeButtonContainer: {
    justifyContent: 'center',
    paddingBottom: Spacing.lg,
  },
  themeSegment: {
    width: '100%',
  },
});
