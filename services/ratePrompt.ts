import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import type { RatePromptData } from '@/types';

const RATE_PROMPT_KEY = 'rate_prompt_data';

const DEFAULT_RATE_DATA: RatePromptData = {
  hasBeenPrompted: false,
  promptedAt: null,
  hasRated: false,
  achievementUnlockCount: 0,
};

export async function getRatePromptData(): Promise<RatePromptData> {
  try {
    const data = await AsyncStorage.getItem(RATE_PROMPT_KEY);
    if (!data) return DEFAULT_RATE_DATA;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading rate prompt data:', error);
    return DEFAULT_RATE_DATA;
  }
}

async function saveRatePromptData(data: RatePromptData): Promise<void> {
  try {
    await AsyncStorage.setItem(RATE_PROMPT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rate prompt data:', error);
    throw error;
  }
}

export async function incrementAchievementCount(): Promise<void> {
  const data = await getRatePromptData();
  data.achievementUnlockCount += 1;
  await saveRatePromptData(data);
}

export async function shouldShowRatePrompt(
  trigger: 'recap_viewed' | 'achievement_unlocked' | 'delivery_milestone' | 'streak_milestone'
): Promise<boolean> {
  try {
    const data = await getRatePromptData();

    // Never show again if already prompted
    if (data.hasBeenPrompted || data.hasRated) {
      return false;
    }

    // Check if store review is available
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    switch (trigger) {
      case 'recap_viewed':
        // Always show after viewing recap (it's a positive moment)
        return true;

      case 'achievement_unlocked':
        // Show after 3rd achievement
        return data.achievementUnlockCount >= 3;

      case 'delivery_milestone':
        // This would be called after 25th delivery
        return true;

      case 'streak_milestone':
        // Show after celebrating a streak milestone (4+ weeks)
        // This is a high-satisfaction moment
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking rate prompt:', error);
    return false;
  }
}

export async function showRatePrompt(): Promise<boolean> {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    // Request the review
    await StoreReview.requestReview();

    // Mark as prompted (we can't know if they actually rated)
    const data = await getRatePromptData();
    data.hasBeenPrompted = true;
    data.promptedAt = new Date().toISOString();
    await saveRatePromptData(data);

    return true;
  } catch (error) {
    console.error('Error showing rate prompt:', error);
    return false;
  }
}

export async function markAsRated(): Promise<void> {
  const data = await getRatePromptData();
  data.hasRated = true;
  await saveRatePromptData(data);
}

export async function resetRatePromptData(): Promise<void> {
  await saveRatePromptData(DEFAULT_RATE_DATA);
}
