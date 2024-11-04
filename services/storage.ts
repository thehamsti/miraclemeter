import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BirthRecord, UserPreferences } from '@/types';

const STORAGE_KEY = 'birth_records';
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
const USER_PREFERENCES_KEY = 'user_preferences';

export async function saveBirthRecord(record: BirthRecord): Promise<void> {
  try {
    const existingRecordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const existingRecords: BirthRecord[] = existingRecordsJson ? JSON.parse(existingRecordsJson) : [];
    
    const updatedRecords = [...existingRecords, record];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
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
      timestamp: new Date(record.timestamp)
    }));
  } catch (error) {
    console.error('Error loading birth records:', error);
    return [];
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

export async function completeOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('Error completing onboarding:', error);
  }
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const value = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
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

export const deleteBirthRecord = async (id: string): Promise<void> => {
  try {
    const records = await getBirthRecords();
    const updatedRecords = records.filter(record => record.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Error deleting birth record:', error);
    throw error;
  }
};

export async function updateBirthRecord(updatedRecord: BirthRecord): Promise<void> {
  try {
    const records = await getBirthRecords();
    const updatedRecords = records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Error updating birth record:', error);
    throw error;
  }
}