import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAchievements,
  saveAchievements,
  checkAchievements,
  getAchievementProgress,
} from '../achievements';
import { ACHIEVEMENTS } from '../../constants/achievements';
import type { BirthRecord, UserPreferences, UserAchievements } from '@/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Achievements Service', () => {
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

  const mockAchievements: UserAchievements = {
    unlocked: ['first-birth'],
    progress: {
      'first-birth': 1,
      'five-births': 5,
    },
    stats: {
      totalDeliveries: 5,
      currentStreak: 2,
      longestStreak: 3,
      deliveryTypes: {
        vaginal: 3,
        cSection: 2,
      },
      multipleBirths: 1,
      angelBabies: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAchievements', () => {
    it('should return existing achievements when they exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockAchievements));

      const result = await getAchievements();

      // Core achievement data should be preserved
      expect(result.unlocked).toEqual(mockAchievements.unlocked);
      expect(result.stats).toEqual(mockAchievements.stats);
      // Existing progress values should be preserved
      expect(result.progress['first-birth']).toBe(mockAchievements.progress['first-birth']);
      expect(result.progress['five-births']).toBe(mockAchievements.progress['five-births']);
      // Progress should include at least all achievement keys
      for (const achievement of ACHIEVEMENTS) {
        expect(result.progress[achievement.id]).toBeDefined();
      }
    });

    it('should initialize achievements when none exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      const result = await getAchievements();

      expect(result.unlocked).toEqual([]);
      expect(result.stats.totalDeliveries).toBe(0);
      expect(result.progress).toBeDefined();
      expect(Object.keys(result.progress)).toHaveLength(ACHIEVEMENTS.length);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'userAchievements',
        expect.stringContaining('"unlocked":[]')
      );
    });

    it('should add progress object if missing from stored data', async () => {
      const achievementsWithoutProgress = { ...mockAchievements };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { progress, ...rest } = achievementsWithoutProgress;
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(rest));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      const result = await getAchievements();

      expect(result.progress).toBeDefined();
      expect(Object.keys(result.progress)).toHaveLength(ACHIEVEMENTS.length);
    });

    it('should return default achievements on error', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await getAchievements();

      expect(result.unlocked).toEqual([]);
      expect(result.stats.totalDeliveries).toBe(0);
    });
  });

  describe('saveAchievements', () => {
    it('should save achievements to storage', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await saveAchievements(mockAchievements);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'userAchievements',
        JSON.stringify(mockAchievements)
      );
    });

    it('should handle save errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Save error'));

      // Should not throw error
      await expect(saveAchievements(mockAchievements)).resolves.toBeUndefined();
    });
  });

  describe('checkAchievements', () => {
    it('should calculate stats correctly for single vaginal birth', async () => {
      const records = [mockRecord];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockAchievements));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      const result = await checkAchievements(records, mockPreferences);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should calculate stats for multiple births with different genders', async () => {
      const records: BirthRecord[] = [
        mockRecord,
        {
          ...mockRecord,
          id: 'test-id-2',
          timestamp: new Date('2024-01-16T10:30:00'),
          babies: [
            { gender: 'girl', birthOrder: 1 },
            { gender: 'girl', birthOrder: 2 },
          ],
        },
        {
          ...mockRecord,
          id: 'test-id-3',
          timestamp: new Date('2024-01-17T10:30:00'),
          babies: [
            { gender: 'angel', birthOrder: 1 },
          ],
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockAchievements));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await checkAchievements(records, mockPreferences);

      const savedData = JSON.parse((mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      
      expect(savedData.stats.totalDeliveries).toBe(3);
      expect(savedData.stats.deliveryTypes.vaginal).toBe(3);
      expect(savedData.stats.multipleBirths).toBe(1);
      expect(savedData.stats.angelBabies).toBe(1);
    });

    it('should calculate streak correctly for consecutive days', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const records: BirthRecord[] = [
        { ...mockRecord, id: '1', timestamp: today },
        { ...mockRecord, id: '2', timestamp: yesterday },
        { ...mockRecord, id: '3', timestamp: twoDaysAgo },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockAchievements));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await checkAchievements(records, mockPreferences);

      const savedData = JSON.parse((mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      
      expect(savedData.stats.currentStreak).toBe(3);
      expect(savedData.stats.longestStreak).toBeGreaterThanOrEqual(3);
    });

    it('should reset streak when gap > 1 day', async () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const records: BirthRecord[] = [
        { ...mockRecord, id: '1', timestamp: today },
        { ...mockRecord, id: '2', timestamp: threeDaysAgo },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockAchievements));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await checkAchievements(records, mockPreferences);

      const savedData = JSON.parse((mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      
      expect(savedData.stats.currentStreak).toBe(1);
    });

    it('should handle records without timestamps', async () => {
      const records: BirthRecord[] = [
        { ...mockRecord, timestamp: undefined },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockAchievements));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await checkAchievements(records, mockPreferences);

      const savedData = JSON.parse((mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      
      expect(savedData.stats.totalDeliveries).toBe(1);
      expect(savedData.stats.currentStreak).toBe(0);
    });

    it('should unlock achievements when requirements are met', async () => {
      const records = Array(10).fill(mockRecord).map((record, index) => ({
        ...record,
        id: `test-${index}`,
        timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // Consecutive days
      }));

      const emptyAchievements: UserAchievements = {
        unlocked: [],
        progress: {},
        stats: {
          totalDeliveries: 0,
          currentStreak: 0,
          longestStreak: 0,
          deliveryTypes: { vaginal: 0, cSection: 0 },
          multipleBirths: 0,
          angelBabies: 0,
        },
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(emptyAchievements));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      const result = await checkAchievements(records, mockPreferences);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('first_delivery');
      expect(result).toContain('ten_deliveries');
    });

    it('should handle weekend achievements correctly', async () => {
      const saturday = new Date('2024-01-13T10:30:00'); // Saturday
      const sunday = new Date('2024-01-14T10:30:00'); // Sunday

      const records: BirthRecord[] = [
        { ...mockRecord, id: '1', timestamp: saturday },
        { ...mockRecord, id: '2', timestamp: sunday },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockAchievements));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await checkAchievements(records, mockPreferences);

      const savedData = JSON.parse((mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      
      const weekendProgress = savedData.progress['weekend_warrior'];
      expect(weekendProgress).toBe(2);
    });

    it('should handle holiday achievements correctly', async () => {
      const christmas = new Date('2024-12-25T10:30:00'); // Christmas

      const records: BirthRecord[] = [
        { ...mockRecord, id: '1', timestamp: christmas },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockAchievements));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await checkAchievements(records, mockPreferences);

      const savedData = JSON.parse((mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      
      const holidayProgress = savedData.progress['holiday_hero'];
      expect(holidayProgress).toBe(1);
    });

    it('should handle shift-related achievements', async () => {
      const sameDay = new Date('2024-01-15T10:30:00');
      const records: BirthRecord[] = [
        { ...mockRecord, id: '1', timestamp: sameDay },
        { ...mockRecord, id: '2', timestamp: new Date(sameDay.getTime() + 2 * 60 * 60 * 1000) }, // 2 hours later
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockAchievements));
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await checkAchievements(records, mockPreferences);

      const savedData = JSON.parse((mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      
      const doubleShiftProgress = savedData.progress['double_duty'];
      expect(doubleShiftProgress).toBe(1);
    });
  });

  describe('getAchievementProgress', () => {
    it('should return correct progress percentage', () => {
      const achievements: UserAchievements = {
        ...mockAchievements,
        progress: {
          'first_delivery': 1,
          'ten_deliveries': 3,
        },
      };

      const firstBirthProgress = getAchievementProgress(achievements, 'first_delivery');
      const fiveBirthsProgress = getAchievementProgress(achievements, 'ten_deliveries');

      expect(firstBirthProgress).toBe(1); // 1/1 = 100%
      expect(fiveBirthsProgress).toBe(0.3); // 3/10 = 30%
    });

    it('should return 0 for unknown achievement', () => {
      const progress = getAchievementProgress(mockAchievements, 'unknown-achievement');
      expect(progress).toBe(0);
    });

    it('should cap progress at 1', () => {
      const achievements: UserAchievements = {
        ...mockAchievements,
        progress: {
          'first_delivery': 5, // Exceeds requirement of 1
        },
      };

      const progress = getAchievementProgress(achievements, 'first_delivery');
      expect(progress).toBe(1);
    });
  });
});