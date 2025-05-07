interface Baby {
  gender: 'boy' | 'girl' | 'angel';
  birthOrder: number;
}

interface BirthRecord {
  id: string;
  timestamp: Date;
  babies: Baby[];
  deliveryType: 'vaginal' | 'c-section';
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

export type { Theme, Language, UserPreferences, BirthRecord, Baby };