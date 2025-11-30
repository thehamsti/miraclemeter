interface Baby {
  gender: 'boy' | 'girl' | 'angel';
  birthOrder: number;
}

interface BirthRecord {
  id: string;
  timestamp?: Date;
  babies: Baby[];
  deliveryType?: 'vaginal' | 'c-section';
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

export type { Theme, Language, UserPreferences, BirthRecord, Baby, Achievement, UserAchievements };