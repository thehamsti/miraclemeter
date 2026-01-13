import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStreakData, getStreakStatus } from '@/services/streaks';

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
  smartNotifications: boolean; // New: contextual notifications
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
  smartNotifications: true,
};

// Save notification preferences
export async function saveNotificationPreferences(prefs: NotificationPreferences) {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  
  if (prefs.enabled) {
    await scheduleSmartReminders(prefs);
  } else {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// Get notification preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const prefs = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
  if (!prefs) return DEFAULT_PREFERENCES;
  
  const parsed = JSON.parse(prefs);
  // Migrate old prefs
  return {
    ...DEFAULT_PREFERENCES,
    ...parsed,
    smartNotifications: parsed.smartNotifications ?? true,
  };
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

// Message templates based on context
const MESSAGES = {
  // Regular encouragement
  regular: [
    "Time to log today's deliveries! Keep track of the miracles you helped bring into the world.",
    "Don't forget to record the precious deliveries from your shift!",
    "Your dedication makes a difference - update your delivery records!",
    "Remember to document today's births and special moments.",
    "Every delivery tells a story - take a moment to record today's births!",
  ],
  
  // Streak at risk (late in week, goal not met)
  atRisk: [
    "Your streak is at risk! Log a delivery to keep it alive.",
    "Don't let your streak slip away - you're so close!",
    "Quick! Your weekly goal is waiting. Let's keep that streak going!",
    "Time's running out this week. One more log saves your streak!",
  ],
  
  // Streak protected (has shields)
  protected: [
    "Your streak is protected by shields, but let's stay active!",
    "Even with shields, consistent logging builds momentum.",
    "Your shields have you covered, but why not log anyway?",
  ],
  
  // Recovery challenge active
  recovery: [
    "You're in a comeback challenge! Log to restore your streak.",
    "Don't give up! Your streak is waiting to be recovered.",
    "Comeback time! Get back in the game.",
  ],
  
  // Goal already met this week
  celebrate: [
    "Weekly goal crushed! Extra logs earn streak shields.",
    "You're on fire this week! Keep the momentum going.",
    "Goal met! Log more to bank shields for later.",
  ],
  
  // Milestone approaching
  milestone: [
    "You're almost at a streak milestone! Don't stop now!",
    "A big milestone is just around the corner. Keep going!",
    "Milestone alert! Stay consistent and celebrate soon.",
  ],
};

function getRandomMessage(category: keyof typeof MESSAGES): string {
  const messages = MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Get contextual message based on streak status
async function getSmartMessage(): Promise<{ title: string; body: string }> {
  try {
    const streakData = await getStreakData();
    const status = getStreakStatus(streakData);
    
    // Recovery challenge active
    if (status.hasRecoveryChallenge) {
      return {
        title: "Comeback Challenge Active! 💪",
        body: getRandomMessage('recovery'),
      };
    }
    
    // Streak at risk
    if (status.isAtRisk) {
      if (streakData.streakShields > 0) {
        return {
          title: "Streak Protected 🛡️",
          body: getRandomMessage('protected'),
        };
      }
      return {
        title: "Streak at Risk! 🔥",
        body: getRandomMessage('atRisk'),
      };
    }
    
    // Weekly goal already met
    if (status.isGoalMet) {
      return {
        title: "Great Week! ⭐",
        body: getRandomMessage('celebrate'),
      };
    }
    
    // Check for approaching milestone
    const nextMilestone = getNextMilestone(streakData.currentStreak);
    if (nextMilestone && nextMilestone.weeksAway <= 2 && streakData.currentStreak > 0) {
      return {
        title: `${nextMilestone.weeksAway} Week${nextMilestone.weeksAway > 1 ? 's' : ''} to Milestone! 🎯`,
        body: getRandomMessage('milestone'),
      };
    }
    
    // Regular reminder
    return {
      title: "Time to Log Deliveries 👶",
      body: getRandomMessage('regular'),
    };
  } catch {
    // Fallback
    return {
      title: "Time to Log Deliveries 👶",
      body: getRandomMessage('regular'),
    };
  }
}

function getNextMilestone(currentStreak: number): { milestone: number; weeksAway: number } | null {
  const milestones = [4, 12, 26, 52, 104, 156];
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return { milestone, weeksAway: milestone - currentStreak };
    }
  }
  return null;
}

// Schedule smart reminders based on streak status
export async function scheduleSmartReminders(prefs: NotificationPreferences) {
  // Cancel existing reminders
  await Notifications.cancelAllScheduledNotificationsAsync();

  const message = await getSmartMessage();

  // Schedule main daily reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: prefs.time.hour,
      minute: prefs.time.minute,
      repeats: true,
    },
  });

  // If smart notifications enabled, schedule additional contextual reminders
  if (prefs.smartNotifications) {
    const streakData = await getStreakData();
    const status = getStreakStatus(streakData);
    
    // Thursday evening reminder if goal not met (extra nudge)
    if (!status.isGoalMet && status.daysLeftInWeek <= 3) {
      const thursday = new Date();
      const day = thursday.getDay();
      const daysUntilThursday = day <= 4 ? 4 - day : 11 - day;
      thursday.setDate(thursday.getDate() + daysUntilThursday);
      thursday.setHours(19, 0, 0, 0);
      
      // Only schedule if Thursday is in the future
      if (thursday > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Weekend Approaching! 📅",
            body: `${status.logsRemaining} more log${status.logsRemaining > 1 ? 's' : ''} to hit your weekly goal.`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: thursday,
          },
        });
      }
    }
    
    // Sunday morning reminder if goal still not met
    if (!status.isGoalMet && status.daysLeftInWeek <= 1) {
      const sunday = new Date();
      const day = sunday.getDay();
      const daysUntilSunday = day === 0 ? 0 : 7 - day;
      sunday.setDate(sunday.getDate() + daysUntilSunday);
      sunday.setHours(10, 0, 0, 0);
      
      if (sunday > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Last Day to Keep Your Streak! ⏰",
            body: streakData.streakShields > 0
              ? "Your shields will protect you, but let's stay active!"
              : "Log now to keep your streak alive!",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: sunday,
          },
        });
      }
    }
  }
}

// Legacy function for backward compatibility
export async function scheduleDailyReminder(prefs: NotificationPreferences) {
  return scheduleSmartReminders(prefs);
}

// Trigger immediate notification (for testing or special events)
export async function sendImmediateNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // null means immediate
  });
}

// Notify about milestone achievement
export async function notifyMilestone(weeks: number) {
  const milestoneNames: Record<number, string> = {
    4: "1 Month",
    12: "3 Months",
    26: "6 Months",
    52: "1 Year",
    104: "2 Years",
    156: "3 Years",
  };
  
  const name = milestoneNames[weeks] || `${weeks} Weeks`;
  
  await sendImmediateNotification(
    "🎉 Streak Milestone!",
    `Incredible! You've hit ${name} of consistent tracking. You're amazing!`
  );
}

// Notify about shield earned
export async function notifyShieldEarned(totalShields: number) {
  await sendImmediateNotification(
    "🛡️ Shield Earned!",
    `You now have ${totalShields} shield${totalShields > 1 ? 's' : ''} to protect your streak.`
  );
}

// Notify about recovery challenge started
export async function notifyRecoveryStarted(daysToComplete: number) {
  await sendImmediateNotification(
    "💪 Comeback Challenge Started",
    `Log 3 times in the next ${daysToComplete} days to restore your streak!`
  );
}

// Notify about recovery success
export async function notifyRecoverySuccess(restoredStreak: number) {
  await sendImmediateNotification(
    "🎊 Streak Restored!",
    `Amazing comeback! Your ${restoredStreak}-week streak is back.`
  );
}
