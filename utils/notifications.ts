import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationPreferences {
  enabled: boolean;
  frequency: 'daily' | 'shift';
  time: {
    hour: number;
    minute: number;
  };
}

const NOTIFICATION_PREFS_KEY = '@notification_preferences';

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  frequency: 'daily',
  time: {
    hour: 20,
    minute: 0,
  },
};

// Save notification preferences
export async function saveNotificationPreferences(prefs: NotificationPreferences) {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  
  if (prefs.enabled) {
    await scheduleDailyReminder(prefs);
  } else {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// Get notification preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const prefs = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
  return prefs ? JSON.parse(prefs) : DEFAULT_PREFERENCES;
}

// Request permissions
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return status === 'granted';
}

// Schedule daily reminder
export async function scheduleDailyReminder(prefs: NotificationPreferences) {
  // Cancel any existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Array of reminder messages for L&D nurses
  const messages = [
    "👶 Time to log today's deliveries! Keep track of the miracles you helped bring into the world.",
    "👼 Don't forget to record the precious deliveries from your shift!",
    "🌟 Your dedication makes a difference - update your delivery records!",
    "📝 Remember to document today's births and special moments.",
    "💝 Every delivery tells a story - take a moment to record today's births!",
    "🎈 Another day of bringing joy into the world! Time to update those records!",
    "🌈 Hey super nurse! Ready to log those special deliveries?",
    "🦸‍♀️ Calling all delivery superheroes - time for your daily record update!",
    "🎊 You're making history with every delivery - let's get them logged!",
    "✨ Stork's daily check-in: Time to document those special deliveries!",
    "🌺 Blooming with new life today? Let's capture those precious moments!",
    "🎯 Target acquired: Time to record today's bundle of joy deliveries!"
  ];

  // Get random message
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  // Schedule notification based on preferences
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to Update Delivery Records 👶",
      body: randomMessage,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: prefs.time.hour,
      minute: prefs.time.minute,
      repeats: true,
    },
  });
}