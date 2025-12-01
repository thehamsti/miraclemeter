import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveBirthRecord,
  getBirthRecords,
  getBirthRecordById,
  isOnboardingComplete,
  completeOnboarding,
  saveUserPreferences,
  getUserPreferences,
  resetStorage,
  deleteBirthRecord,
  updateBirthRecord,
} from '../storage';
import type { BirthRecord, UserPreferences } from '@/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock achievements
jest.mock('../achievements', () => ({
  checkAchievements: jest.fn().mockResolvedValue(['achievement-1']),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Storage Service', () => {
  const mockRecord: BirthRecord = {
    id: 'test-id-1',
    timestamp: new Date('2024-01-15T10:30:00'),
    deliveryType: 'vaginal',
    eventType: 'delivery',
    babies: [
      { gender: 'boy', birthOrder: 1 },
    ],
    notes: 'Test delivery',
  };

  const mockPreferences: UserPreferences = {
    name: 'Test User',
    tutorialCompleted: true,
    theme: 'light',
    shift: 'day',
    shiftTimes: { start: '07:00', end: '19:00' },
    notifications: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveBirthRecord', () => {
    it('should save a new birth record and return achievement IDs', async () => {
      // Setup: No existing records
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockPreferences));

      const result = await saveBirthRecord(mockRecord);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'birth_records',
        JSON.stringify([mockRecord])
      );
      expect(result).toEqual(['achievement-1']);
    });

    it('should add to existing records', async () => {
      const existingRecord: BirthRecord = {
        ...mockRecord,
        id: 'existing-id',
        timestamp: new Date('2024-01-14T10:30:00'),
      };

      // Setup: One existing record
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingRecord]));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockPreferences));

      await saveBirthRecord(mockRecord);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'birth_records',
        JSON.stringify([existingRecord, mockRecord])
      );
    });

    it('should throw error when save fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(saveBirthRecord(mockRecord)).rejects.toThrow('Storage error');
    });
  });

  describe('getBirthRecords', () => {
    it('should return empty array when no records exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await getBirthRecords();

      expect(result).toEqual([]);
    });

    it('should return parsed records with Date objects', async () => {
      const recordsWithDateStrings = [
        { ...mockRecord, timestamp: mockRecord.timestamp?.toISOString() },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(recordsWithDateStrings));

      const result = await getBirthRecords();

      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBeInstanceOf(Date);
      expect(result[0].timestamp?.toISOString()).toBe(mockRecord.timestamp?.toISOString());
    });

    it('should handle records with missing timestamps', async () => {
      const recordWithoutTimestamp = { ...mockRecord, timestamp: undefined };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([recordWithoutTimestamp]));

      const result = await getBirthRecords();

      expect(result[0].timestamp).toBeUndefined();
    });

    it('should throw error when storage fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

      await expect(getBirthRecords()).rejects.toThrow('Failed to load birth records');
    });

    it('should handle corrupted JSON', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

      await expect(getBirthRecords()).rejects.toThrow();
    });
  });

  describe('getBirthRecordById', () => {
    it('should return record when found', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([mockRecord]));

      const result = await getBirthRecordById('test-id-1');

      expect(result).toEqual(mockRecord);
    });

    it('should return null when not found', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([mockRecord]));

      const result = await getBirthRecordById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw error when storage fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

      await expect(getBirthRecordById('test-id')).rejects.toThrow('Failed to load birth record');
    });
  });

  describe('isOnboardingComplete', () => {
    it('should return true when onboarding is complete', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('true');

      const result = await isOnboardingComplete();

      expect(result).toBe(true);
    });

    it('should return false when onboarding is not complete', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('false');

      const result = await isOnboardingComplete();

      expect(result).toBe(false);
    });

    it('should return false when no value exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await isOnboardingComplete();

      expect(result).toBe(false);
    });

    it('should throw error when storage fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

      await expect(isOnboardingComplete()).rejects.toThrow('Failed to check onboarding status');
    });
  });

  describe('completeOnboarding', () => {
    it('should set onboarding to complete', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await completeOnboarding();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('onboarding_complete', 'true');
    });

    it('should throw error when save fails', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Save error'));

      await expect(completeOnboarding()).rejects.toThrow('Failed to complete onboarding');
    });
  });

  describe('saveUserPreferences', () => {
    it('should save user preferences', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await saveUserPreferences(mockPreferences);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_preferences',
        JSON.stringify(mockPreferences)
      );
    });

    it('should throw error when save fails', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Save error'));

      await expect(saveUserPreferences(mockPreferences)).rejects.toThrow('Failed to save user preferences');
    });
  });

  describe('getUserPreferences', () => {
    it('should return preferences when they exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockPreferences));

      const result = await getUserPreferences();

      expect(result).toEqual(mockPreferences);
    });

    it('should return null when no preferences exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await getUserPreferences();

      expect(result).toBeNull();
    });

    it('should throw error when storage fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

      await expect(getUserPreferences()).rejects.toThrow('Failed to load user preferences');
    });
  });

  describe('resetStorage', () => {
    it('should clear all storage', async () => {
      mockAsyncStorage.clear.mockResolvedValueOnce(undefined);

      await resetStorage();

      expect(mockAsyncStorage.clear).toHaveBeenCalled();
    });

    it('should throw error when clear fails', async () => {
      mockAsyncStorage.clear.mockRejectedValueOnce(new Error('Clear error'));

      await expect(resetStorage()).rejects.toThrow('Clear error');
    });
  });

  describe('deleteBirthRecord', () => {
    it('should delete the specified record', async () => {
      const recordToDelete = { ...mockRecord, id: 'delete-me' };
      const recordToKeep = { ...mockRecord, id: 'keep-me' };
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([recordToDelete, recordToKeep]));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await deleteBirthRecord('delete-me');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'birth_records',
        JSON.stringify([recordToKeep])
      );
    });

    it('should throw error when delete fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

      await expect(deleteBirthRecord('test-id')).rejects.toThrow('Failed to load birth records');
    });
  });

  describe('updateBirthRecord', () => {
    it('should update the specified record', async () => {
      const originalRecord = { ...mockRecord, notes: 'Original notes' };
      const updatedRecord = { ...mockRecord, notes: 'Updated notes' };
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([originalRecord]));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockPreferences));

      const result = await updateBirthRecord(updatedRecord);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'birth_records',
        JSON.stringify([updatedRecord])
      );
      expect(result).toEqual(['achievement-1']);
    });

    it('should throw error when update fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

      await expect(updateBirthRecord(mockRecord)).rejects.toThrow('Failed to load birth records');
    });
  });
});