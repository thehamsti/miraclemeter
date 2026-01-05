import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useStatistics } from '../useStatistics';
import { getBirthRecords } from '@/services/storage';
import type { BirthRecord } from '@/types';

// Mock the storage service
jest.mock('@/services/storage', () => ({
  getBirthRecords: jest.fn(),
}));

// Mock useFocusEffect to call the callback in useEffect style
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => (() => void) | void) => {
    const React = require('react');
    React.useEffect(() => {
      const cleanup = callback();
      return cleanup;
    }, []);
  },
}));

const mockGetBirthRecords = getBirthRecords as jest.MockedFunction<typeof getBirthRecords>;

describe('useStatistics', () => {
  const createMockRecord = (
    overrides: Partial<BirthRecord> = {}
  ): BirthRecord => ({
    id: `test-${Math.random()}`,
    timestamp: new Date(),
    deliveryType: 'vaginal',
    eventType: 'delivery',
    babies: [{ gender: 'boy', birthOrder: 1 }],
    notes: '',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBirthRecords.mockResolvedValue([]);
  });

  describe('initial state', () => {
    it('should have zero counts when no records exist', async () => {
      mockGetBirthRecords.mockResolvedValue([]);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalDeliveries).toBe(0);
      expect(result.current.totalBabies).toBe(0);
      expect(result.current.todayCount).toBe(0);
      expect(result.current.weekCount).toBe(0);
      expect(result.current.monthCount).toBe(0);
    });
  });

  describe('totalDeliveries', () => {
    it('should count total records', async () => {
      const records = [createMockRecord(), createMockRecord(), createMockRecord()];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalDeliveries).toBe(3);
    });
  });

  describe('totalBabies', () => {
    it('should count babies across all records', async () => {
      const records = [
        createMockRecord({
          babies: [
            { gender: 'boy', birthOrder: 1 },
            { gender: 'girl', birthOrder: 2 },
          ],
        }),
        createMockRecord({
          babies: [{ gender: 'boy', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalBabies).toBe(3);
    });
  });

  describe('todayCount', () => {
    it('should count records from today', async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const records = [
        createMockRecord({ timestamp: today }),
        createMockRecord({ timestamp: today }),
        createMockRecord({ timestamp: yesterday }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todayCount).toBe(2);
    });

    it('should not count records without timestamps', async () => {
      const records = [
        createMockRecord({ timestamp: new Date() }),
        createMockRecord({ timestamp: undefined }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todayCount).toBe(1);
    });
  });

  describe('weekCount', () => {
    it('should count records from the last 7 days', async () => {
      const today = new Date();
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const records = [
        createMockRecord({ timestamp: today }),
        createMockRecord({ timestamp: fiveDaysAgo }),
        createMockRecord({ timestamp: tenDaysAgo }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.weekCount).toBe(2);
    });
  });

  describe('monthCount', () => {
    it('should count records from the last month', async () => {
      const today = new Date();
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const records = [
        createMockRecord({ timestamp: today }),
        createMockRecord({ timestamp: twoWeeksAgo }),
        createMockRecord({ timestamp: twoMonthsAgo }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.monthCount).toBe(2);
    });
  });

  describe('genderCounts', () => {
    it('should count boys correctly', async () => {
      const records = [
        createMockRecord({
          babies: [
            { gender: 'boy', birthOrder: 1 },
            { gender: 'boy', birthOrder: 2 },
          ],
        }),
        createMockRecord({
          babies: [{ gender: 'boy', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.genderCounts.boys).toBe(3);
    });

    it('should count girls correctly', async () => {
      const records = [
        createMockRecord({
          babies: [{ gender: 'girl', birthOrder: 1 }],
        }),
        createMockRecord({
          babies: [{ gender: 'girl', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.genderCounts.girls).toBe(2);
    });

    it('should count angels correctly', async () => {
      const records = [
        createMockRecord({
          babies: [{ gender: 'angel', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.genderCounts.angels).toBe(1);
    });

    it('should handle mixed genders', async () => {
      const records = [
        createMockRecord({
          babies: [
            { gender: 'boy', birthOrder: 1 },
            { gender: 'girl', birthOrder: 2 },
          ],
        }),
        createMockRecord({
          babies: [{ gender: 'angel', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.genderCounts.boys).toBe(1);
      expect(result.current.genderCounts.girls).toBe(1);
      expect(result.current.genderCounts.angels).toBe(1);
    });
  });

  describe('deliveryCounts', () => {
    it('should count vaginal deliveries', async () => {
      const records = [
        createMockRecord({ deliveryType: 'vaginal' }),
        createMockRecord({ deliveryType: 'vaginal' }),
        createMockRecord({ deliveryType: 'c-section' }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.deliveryCounts.vaginal).toBe(2);
    });

    it('should count c-section deliveries', async () => {
      const records = [
        createMockRecord({ deliveryType: 'c-section' }),
        createMockRecord({ deliveryType: 'c-section' }),
        createMockRecord({ deliveryType: 'vaginal' }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.deliveryCounts.cSection).toBe(2);
    });
  });

  describe('recentRecords', () => {
    it('should return up to 5 most recent records', async () => {
      const records = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return createMockRecord({ id: `record-${i}`, timestamp: date });
      });
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.recentRecords.length).toBe(5);
    });

    it('should sort records newest first', async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const records = [
        createMockRecord({ id: 'oldest', timestamp: twoDaysAgo }),
        createMockRecord({ id: 'newest', timestamp: today }),
        createMockRecord({ id: 'middle', timestamp: yesterday }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.recentRecords[0].id).toBe('newest');
      expect(result.current.recentRecords[1].id).toBe('middle');
      expect(result.current.recentRecords[2].id).toBe('oldest');
    });

    it('should return all records if less than 5', async () => {
      const records = [createMockRecord(), createMockRecord()];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.recentRecords.length).toBe(2);
    });
  });

  describe('refresh', () => {
    it('should reload data when refresh is called', async () => {
      mockGetBirthRecords.mockResolvedValue([createMockRecord()]);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalDeliveries).toBe(1);

      // Add another record
      mockGetBirthRecords.mockResolvedValue([
        createMockRecord(),
        createMockRecord(),
      ]);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.totalDeliveries).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockGetBirthRecords.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not crash, should have default values
      expect(result.current.totalDeliveries).toBe(0);
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('yearlyBabyCounts', () => {
    it('should group records by year correctly', async () => {
      const records = [
        createMockRecord({
          timestamp: new Date('2024-06-15'),
          babies: [{ gender: 'boy', birthOrder: 1 }],
        }),
        createMockRecord({
          timestamp: new Date('2024-08-20'),
          babies: [{ gender: 'girl', birthOrder: 1 }],
        }),
        createMockRecord({
          timestamp: new Date('2023-03-10'),
          babies: [{ gender: 'boy', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.yearlyBabyCounts).toHaveLength(2);
      const year2024 = result.current.yearlyBabyCounts.find(y => y.year === 2024);
      const year2023 = result.current.yearlyBabyCounts.find(y => y.year === 2023);
      expect(year2024?.babies).toBe(2);
      expect(year2023?.babies).toBe(1);
    });

    it('should calculate gender breakdown per year', async () => {
      const records = [
        createMockRecord({
          timestamp: new Date('2024-06-15'),
          babies: [
            { gender: 'boy', birthOrder: 1 },
            { gender: 'girl', birthOrder: 2 },
          ],
        }),
        createMockRecord({
          timestamp: new Date('2024-08-20'),
          babies: [{ gender: 'angel', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const year2024 = result.current.yearlyBabyCounts.find(y => y.year === 2024);
      expect(year2024?.genders.boys).toBe(1);
      expect(year2024?.genders.girls).toBe(1);
      expect(year2024?.genders.angels).toBe(1);
    });

    it('should calculate delivery breakdown per year', async () => {
      const records = [
        createMockRecord({
          timestamp: new Date('2024-06-15'),
          deliveryType: 'vaginal',
          babies: [{ gender: 'boy', birthOrder: 1 }],
        }),
        createMockRecord({
          timestamp: new Date('2024-08-20'),
          deliveryType: 'c-section',
          babies: [{ gender: 'girl', birthOrder: 1 }],
        }),
        createMockRecord({
          timestamp: new Date('2024-09-10'),
          deliveryType: 'vaginal',
          babies: [{ gender: 'boy', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const year2024 = result.current.yearlyBabyCounts.find(y => y.year === 2024);
      expect(year2024?.deliveries.vaginal).toBe(2);
      expect(year2024?.deliveries.cSection).toBe(1);
      expect(year2024?.deliveries.total).toBe(3);
    });

    it('should skip records without timestamps in yearly calculations', async () => {
      const records = [
        createMockRecord({
          timestamp: new Date('2024-06-15'),
          babies: [{ gender: 'boy', birthOrder: 1 }],
        }),
        createMockRecord({
          timestamp: undefined,
          babies: [{ gender: 'girl', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.yearlyBabyCounts).toHaveLength(1);
      const year2024 = result.current.yearlyBabyCounts.find(y => y.year === 2024);
      expect(year2024?.babies).toBe(1);
    });

    it('should default missing deliveryType to unknown', async () => {
      const records = [
        createMockRecord({
          timestamp: new Date('2024-06-15'),
          deliveryType: undefined,
          babies: [{ gender: 'boy', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const year2024 = result.current.yearlyBabyCounts.find(y => y.year === 2024);
      expect(year2024?.deliveries.unknown).toBe(1);
      expect(year2024?.deliveries.vaginal).toBe(0);
      expect(year2024?.deliveries.cSection).toBe(0);
    });

    it('should sort years descending', async () => {
      const records = [
        createMockRecord({
          timestamp: new Date('2022-06-15'),
          babies: [{ gender: 'boy', birthOrder: 1 }],
        }),
        createMockRecord({
          timestamp: new Date('2024-06-15'),
          babies: [{ gender: 'girl', birthOrder: 1 }],
        }),
        createMockRecord({
          timestamp: new Date('2023-06-15'),
          babies: [{ gender: 'angel', birthOrder: 1 }],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.yearlyBabyCounts[0].year).toBe(2024);
      expect(result.current.yearlyBabyCounts[1].year).toBe(2023);
      expect(result.current.yearlyBabyCounts[2].year).toBe(2022);
    });

    it('should return empty array when no records exist', async () => {
      mockGetBirthRecords.mockResolvedValue([]);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.yearlyBabyCounts).toEqual([]);
    });

    it('should handle records with empty babies array', async () => {
      const records = [
        createMockRecord({
          timestamp: new Date('2024-06-15'),
          deliveryType: 'vaginal',
          babies: [],
        }),
      ];
      mockGetBirthRecords.mockResolvedValue(records);

      const { result } = renderHook(() => useStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const year2024 = result.current.yearlyBabyCounts.find(y => y.year === 2024);
      expect(year2024?.babies).toBe(0);
      expect(year2024?.deliveries.total).toBe(1);
    });
  });
});
