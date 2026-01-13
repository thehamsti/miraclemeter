import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BirthRecord, UserPreferences } from '@/types';
import { checkAchievements } from './achievements';
import { updateWidgetData, calculateTodayCount } from './widgetBridge';
import { updateStreakOnDelivery } from './streaks';

export class StorageError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

const STORAGE_KEY = 'birth_records';
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
const USER_PREFERENCES_KEY = 'user_preferences';
const APP_VERSION_KEY = 'app_version';
const getHomeRecapDismissedKey = (year: number) => `home_recap_dismissed_${year}`;

export interface SaveBirthRecordResult {
  achievements: string[];
  streakMilestone: number | null;
  shieldEarned: boolean;
  recoveryCompleted: boolean;
}

export async function saveBirthRecord(record: BirthRecord): Promise<string[]>;
export async function saveBirthRecord(record: BirthRecord, returnFullResult: true): Promise<SaveBirthRecordResult>;
export async function saveBirthRecord(record: BirthRecord, returnFullResult?: boolean): Promise<string[] | SaveBirthRecordResult> {
  try {
    const existingRecordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const existingRecords: BirthRecord[] = existingRecordsJson ? JSON.parse(existingRecordsJson) : [];
    
    const updatedRecords = [...existingRecords, record];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    
    // Check for new achievements
    const preferences = await getUserPreferences();
    const newAchievements = await checkAchievements(updatedRecords, preferences || { tutorialCompleted: true });
    
    // Sync with widget
    const todayCount = calculateTodayCount(updatedRecords.map(r => ({
      timestamp: r.timestamp ? new Date(r.timestamp) : undefined
    })));
    await updateWidgetData(todayCount, updatedRecords.length);
    
    // Update streak and get milestone info
    const streakResult = await updateStreakOnDelivery();
    
    // Return full result if requested
    if (returnFullResult) {
      return {
        achievements: newAchievements,
        streakMilestone: streakResult.newMilestone,
        shieldEarned: streakResult.shieldEarned,
        recoveryCompleted: streakResult.recoveryCompleted,
      };
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error saving birth record:', error);
    throw error;
  }
}

export async function getBirthRecords(): Promise<BirthRecord[]> {
  try {
    const recordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (!recordsJson) return [];
    
    const records: BirthRecord[] = JSON.parse(recordsJson);
    // Convert stored date strings back to Date objects
    return records.map(record => ({
      ...record,
      timestamp: record.timestamp ? new Date(record.timestamp) : undefined
    }));
  } catch (error) {
    console.error('Error loading birth records:', error);
    throw new StorageError('Failed to load birth records', error instanceof Error ? error : undefined);
  }
}

export async function getBirthRecordById(id: string): Promise<BirthRecord | null> {
  try {
    const records = await getBirthRecords();
    const record = records.find(r => r.id === id);
    return record || null;
  } catch (error) {
    console.error('Error loading birth record by ID:', error);
    throw new StorageError('Failed to load birth record', error instanceof Error ? error : undefined);
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    throw new StorageError('Failed to check onboarding status', error instanceof Error ? error : undefined);
  }
}

export async function completeOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw new StorageError('Failed to complete onboarding', error instanceof Error ? error : undefined);
  }
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw new StorageError('Failed to save user preferences', error instanceof Error ? error : undefined);
  }
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const value = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw new StorageError('Failed to load user preferences', error instanceof Error ? error : undefined);
  }
}

export async function resetStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
    console.log('Storage successfully cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

export async function getStoredAppVersion(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(APP_VERSION_KEY);
  } catch (error) {
    console.error('Error getting stored app version:', error);
    throw new StorageError('Failed to load app version', error instanceof Error ? error : undefined);
  }
}

export async function setStoredAppVersion(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(APP_VERSION_KEY, version);
  } catch (error) {
    console.error('Error saving stored app version:', error);
    throw new StorageError('Failed to save app version', error instanceof Error ? error : undefined);
  }
}

export async function getHomeRecapDismissed(year: number): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(getHomeRecapDismissedKey(year));
    return value === 'true';
  } catch (error) {
    console.error('Error getting recap dismissal status:', error);
    throw new StorageError('Failed to load recap dismissal status', error instanceof Error ? error : undefined);
  }
}

export async function setHomeRecapDismissed(year: number, dismissed: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(getHomeRecapDismissedKey(year), dismissed ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving recap dismissal status:', error);
    throw new StorageError('Failed to save recap dismissal status', error instanceof Error ? error : undefined);
  }
}

export async function deleteBirthRecord(id: string): Promise<void> {
  try {
    const records = await getBirthRecords();
    const updatedRecords = records.filter(record => record.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    
    // Sync with widget
    const todayCount = calculateTodayCount(updatedRecords.map(r => ({
      timestamp: r.timestamp ? new Date(r.timestamp) : undefined
    })));
    await updateWidgetData(todayCount, updatedRecords.length);
  } catch (error) {
    console.error('Error deleting birth record:', error);
    throw error;
  }
}

export async function updateBirthRecord(updatedRecord: BirthRecord): Promise<string[]> {
  try {
    const records = await getBirthRecords();
    const updatedRecords = records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    
    // Check for new achievements
    const preferences = await getUserPreferences();
    const newAchievements = await checkAchievements(updatedRecords, preferences || { tutorialCompleted: true });
    
    // Sync with widget
    const todayCount = calculateTodayCount(updatedRecords.map(r => ({
      timestamp: r.timestamp ? new Date(r.timestamp) : undefined
    })));
    await updateWidgetData(todayCount, updatedRecords.length);
    
    return newAchievements;
  } catch (error) {
    console.error('Error updating birth record:', error);
    throw error;
  }
}
