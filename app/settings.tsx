import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Platform, ScrollView, View, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { 
  requestNotificationPermissions, 
  scheduleDailyReminder,
  getNotificationPreferences,
  saveNotificationPreferences
} from '@/utils/notifications';
import { getUserPreferences, saveUserPreferences } from '@/services/storage';
import { getStreakData, setWeeklyGoal } from '@/services/streaks';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/ThemeContext';
import { ThemedSwitch } from '@/components/ThemedSwitch';
import { ThemedSegmentedButtons } from '@/components/ThemedSegmentedButtons';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { UserPreferences } from '@/types';

export default function SettingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderLightColor = useThemeColor({}, 'borderLight');

  const recapYear = new Date().getFullYear() - 1;
  // Profile state
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [shift, setShift] = useState<'day' | 'night' | 'rotating'>('day');
  
  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'shift'>('daily');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { theme, setTheme, effectiveTheme } = useTheme();
  
  // Streak settings
  const [weeklyGoalValue, setWeeklyGoalValue] = useState(1);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    // Load notification preferences
    const notifPrefs = await getNotificationPreferences();
    setNotificationsEnabled(notifPrefs.enabled);
    setFrequency(notifPrefs.frequency);
    const prefTime = new Date();
    prefTime.setHours(notifPrefs.time.hour);
    prefTime.setMinutes(notifPrefs.time.minute);
    setTime(prefTime);
    
    // Load user preferences
    const userPrefs = await getUserPreferences();
    if (userPrefs) {
      setName(userPrefs.name || '');
      setUnit(userPrefs.unit || '');
      setShift(userPrefs.shift || 'day');
    }
    
    // Load streak settings
    const streakData = await getStreakData();
    setWeeklyGoalValue(streakData.weeklyGoal);
  }
  
  async function handleWeeklyGoalChange(goal: number) {
    setWeeklyGoalValue(goal);
    await setWeeklyGoal(goal);
  }

  async function saveProfileChanges(updates: Partial<UserPreferences>) {
    try {
      const currentPrefs = await getUserPreferences();
      const updatedPrefs: UserPreferences = {
        ...currentPrefs,
        tutorialCompleted: currentPrefs?.tutorialCompleted ?? true,
        ...updates,
      };
      await saveUserPreferences(updatedPrefs);
    } catch (error) {
      console.error('Failed to save profile changes:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  }

  function handleTimeChange(_event: unknown, selectedTime?: Date) {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      updateNotifications(notificationsEnabled, frequency, selectedTime);
    }
  }

  async function updateNotifications(enabled: boolean, freq: 'daily' | 'shift', notifTime: Date) {
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

        await scheduleDailyReminder({
          enabled,
          frequency: freq,
          time: {
            hour: notifTime.getHours(),
            minute: notifTime.getMinutes(),
          },
          smartNotifications: true,
        });
      }

      await saveNotificationPreferences({
        enabled,
        frequency: freq,
        time: {
          hour: notifTime.getHours(),
          minute: notifTime.getMinutes(),
        },
        smartNotifications: true,
      });

      if (enabled) {
        Alert.alert(
          "Success",
          `Reminder notifications have been set up for ${notifTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        );
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      Alert.alert(
        "Error",
        "Failed to update notification settings. Please try again."
      );
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
          {/* Header Section with Gradient */}
          <LinearGradient
            colors={[primaryColor, primaryColor + '95']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </Pressable>
              <View style={styles.headerTextContainer}>
                <ThemedText style={[styles.headerSubtitle, { color: 'white' }]}>
                  Customize Your
                </ThemedText>
                <ThemedText style={[styles.headerTitle, { color: 'white' }]}>
                  Settings
                </ThemedText>
              </View>
              <View style={[styles.headerIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Ionicons name="settings" size={28} color="white" />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionsContainer}>
            {/* Profile Section */}
            <View style={[styles.section, { backgroundColor: surfaceColor }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: primaryColor + '15' }]}>
                  <Ionicons name="person-outline" size={22} color={primaryColor} />
                </View>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Profile
                </ThemedText>
              </View>
              
              <View style={styles.profileFormContainer}>
                <TextInput
                  label="Your Name"
                  placeholder="How should we call you?"
                  value={name}
                  onChangeText={setName}
                  onBlur={() => saveProfileChanges({ name: name.trim() || undefined })}
                  leftIcon="person-outline"
                />
                
                <TextInput
                  label="Unit / Department"
                  placeholder="Where do you work?"
                  value={unit}
                  onChangeText={setUnit}
                  onBlur={() => saveProfileChanges({ unit: unit.trim() || undefined })}
                  leftIcon="business-outline"
                />
                
                <View style={styles.shiftContainer}>
                  <ThemedText style={[styles.shiftLabel, { color: textSecondaryColor }]}>
                    Shift Preference
                  </ThemedText>
                  <ThemedSegmentedButtons
                    value={shift}
                    onValueChange={(value) => {
                      const newShift = value as 'day' | 'night' | 'rotating';
                      setShift(newShift);
                      saveProfileChanges({ shift: newShift });
                    }}
                    buttons={[
                      { value: 'day', label: 'Day' },
                      { value: 'night', label: 'Night' },
                      { value: 'rotating', label: 'Rotating' },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Appearance Section */}
            <View style={[styles.section, { backgroundColor: surfaceColor }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: primaryColor + '15' }]}>
                  <Ionicons name="color-palette-outline" size={22} color={primaryColor} />
                </View>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Appearance
                </ThemedText>
              </View>
              
              <View style={[styles.settingItem, { borderBottomColor: borderLightColor }]}>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                    Theme
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textSecondaryColor }]}>
                    Choose your preferred appearance
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.themeButtonContainer}>
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

            {/* Streak Settings Section */}
            <View style={[styles.section, { backgroundColor: surfaceColor }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: '#FF6B35' + '15' }]}>
                  <MaterialCommunityIcons name="fire" size={22} color="#FF6B35" />
                </View>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Weekly Streak
                </ThemedText>
              </View>
              
              <View style={[styles.settingItem, { borderBottomColor: borderLightColor }]}>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                    Weekly Goal
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textSecondaryColor }]}>
                    How many days per week to log deliveries
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.weeklyGoalContainer}>
                <ThemedSegmentedButtons
                  value={String(weeklyGoalValue)}
                  onValueChange={(value) => handleWeeklyGoalChange(Number(value))}
                  buttons={[
                    { value: '1', label: '1 day' },
                    { value: '2', label: '2 days' },
                    { value: '3', label: '3 days' },
                    { value: '4', label: '4+ days' },
                  ]}
                  style={styles.goalSegment}
                />
                <ThemedText style={[styles.goalHint, { color: textSecondaryColor }]}>
                  Meet your goal each week to build your streak
                </ThemedText>
              </View>
            </View>

            {/* More Section */}
            <View style={[styles.section, { backgroundColor: surfaceColor }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: primaryColor + '15' }]}>
                  <Ionicons name="sparkles-outline" size={22} color={primaryColor} />
                </View>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  More
                </ThemedText>
              </View>

              <Pressable
                onPress={() => router.push('/recap')}
                style={({ pressed }) => [
                  styles.settingItem,
                  { borderBottomWidth: 0 },
                  pressed && { opacity: 0.7 }
                ]}
              >
                <View style={styles.settingTextContainer}>
                  <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                    View {recapYear} Wrap
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textSecondaryColor }]}>
                    See your year in review
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
              </Pressable>
            </View>

            {/* Notifications Section */}
            <View style={[styles.section, { backgroundColor: surfaceColor }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: primaryColor + '15' }]}>
                  <Ionicons name="notifications-outline" size={22} color={primaryColor} />
                </View>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Notifications
                </ThemedText>
              </View>
              
              <View style={[styles.settingItem, { borderBottomColor: borderLightColor }]}>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                    Daily Reminders
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textSecondaryColor }]}>
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
                    <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                      Frequency
                    </ThemedText>
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
                    <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                      Reminder Time
                    </ThemedText>
                    {Platform.OS === 'ios' ? (
                      <DateTimePicker
                        value={time}
                        mode="time"
                        onChange={handleTimeChange}
                        style={styles.timePicker}
                        themeVariant={effectiveTheme === 'dark' ? 'dark' : 'light'}
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
          </View>

          {/* Bottom spacing for safe area */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            onChange={handleTimeChange}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.xl + Spacing.sm,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.wide,
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionsContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    gap: Spacing.md,
  },
  section: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
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
  themeButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  themeSegment: {
    width: '100%',
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
  profileFormContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  shiftContainer: {
    marginTop: Spacing.xs,
  },
  shiftLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
    letterSpacing: Typography.letterSpacing.wide,
  },
  weeklyGoalContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  goalSegment: {
    width: '100%',
  },
  goalHint: {
    fontSize: Typography.xs,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
