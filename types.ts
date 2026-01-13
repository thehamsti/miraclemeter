interface Baby {
  gender: 'boy' | 'girl' | 'angel';
  birthOrder: number;
}

interface BirthRecord {
  id: string;
  timestamp?: Date;
  babies: Baby[];
  deliveryType?: 'vaginal' | 'c-section' | 'unknown';
  eventType?: 'delivery' | 'transition';
  notes?: string;
}

interface UserPreferences {
  name?: string;
  unit?: string;
  shift?: 'day' | 'night' | 'rotating';
  shiftTimes?: {
    start: string;
    end: string;
  };
  tutorialCompleted: boolean;
  theme?: Theme;
  language?: Language;
  notifications?: boolean;
}

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'es';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Material icon name
  category: 'milestone' | 'streak' | 'special' | 'skill';
  requirement: {
    type: 'count' | 'streak' | 'specific';
    value: number;
    condition?: string; // For specific achievements
  };
  unlockedAt?: Date;
  progress?: number; // Current progress towards achievement
}

interface UserAchievements {
  unlocked: string[]; // Achievement IDs
  progress: Record<string, number>; // Achievement ID -> progress
  stats: {
    totalDeliveries: number;
    currentStreak: number;
    longestStreak: number;
    lastDeliveryDate?: Date;
    deliveryTypes: {
      vaginal: number;
      cSection: number;
    };
    multipleBirths: number;
    angelBabies: number;
  };
}

interface YearlyBabyCount {
  year: number;
  babies: number;
  genders: {
    boys: number;
    girls: number;
    angels: number;
  };
  deliveries: {
    vaginal: number;
    cSection: number;
    unknown: number;
    total: number;
  };
}

interface StreakData {
  // Core streak tracking (now weekly-based)
  currentStreak: number; // Consecutive active weeks
  longestStreak: number;
  lastLogDate: string | null; // ISO date string (YYYY-MM-DD)
  
  // Weekly goal system
  weeklyGoal: number; // Target logs per week (default: 1)
  currentWeekLogs: number; // How many times logged this week
  weekStartDate: string | null; // Start of current tracking week (Monday)
  
  // Streak shields (freeze protection)
  streakShields: number; // Earned tokens that protect streaks (max 3)
  
  // Recovery challenge
  recoveryChallenge: {
    active: boolean;
    targetLogs: number; // How many logs needed to recover
    currentLogs: number; // Progress toward recovery
    deadline: string | null; // ISO date string
    originalStreak: number; // The streak being recovered
  } | null;
  
  // Milestones
  milestonesCelebrated: number[]; // Week milestones already shown (4, 12, 26, 52, etc.)
  
  // Legacy field (deprecated, kept for migration)
  streakSaveUsedAt: string | null;
}

interface RatePromptData {
  hasBeenPrompted: boolean;
  promptedAt: string | null; // ISO date string
  hasRated: boolean;
  achievementUnlockCount: number; // Track unlocks to trigger at 3rd
}

export type { Theme, Language, UserPreferences, BirthRecord, Baby, Achievement, UserAchievements, YearlyBabyCount, StreakData, RatePromptData };
