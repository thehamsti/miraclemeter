import { mergeRecords } from '../cloudSync';
import type { BirthRecord } from '@/types';

// mergeRecords is pure; stub AsyncStorage so importing cloudSync doesn't throw.
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiGet: jest.fn(),
  getAllKeys: jest.fn(),
}));

function makeRecord(id: string, overrides: Partial<BirthRecord> = {}): BirthRecord {
  return {
    id,
    babies: [{ gender: 'boy', birthOrder: 1 }],
    ...overrides,
  };
}

describe('cloudSync mergeRecords', () => {
  it('returns an empty array when both sides are empty', () => {
    expect(mergeRecords([], [])).toEqual([]);
  });

  it('unions records by id without duplicating', () => {
    const local = [makeRecord('1'), makeRecord('2')];
    const remote = [makeRecord('2'), makeRecord('3')];

    const merged = mergeRecords(local, remote);

    expect(merged.map((r) => r.id).sort()).toEqual(['1', '2', '3']);
  });

  it('keeps the newer version when both sides have the same id', () => {
    const local = makeRecord('1', { updatedAt: '2024-01-01T00:00:00.000Z', notes: 'old' });
    const remote = makeRecord('1', { updatedAt: '2024-02-01T00:00:00.000Z', notes: 'new' });

    const merged = mergeRecords([local], [remote]);

    expect(merged).toHaveLength(1);
    expect(merged[0].notes).toBe('new');
  });

  it('falls back to timestamp when updatedAt is missing', () => {
    const local = makeRecord('1', { timestamp: new Date('2024-01-01T00:00:00.000Z'), notes: 'old' });
    const remote = makeRecord('1', { timestamp: new Date('2024-03-01T00:00:00.000Z'), notes: 'new' });

    const merged = mergeRecords([local], [remote]);

    expect(merged[0].notes).toBe('new');
  });

  it('propagates a tombstone when the delete is not older', () => {
    const local = makeRecord('1', { updatedAt: '2024-01-01T00:00:00.000Z', notes: 'live' });
    const remote = makeRecord('1', { deletedAt: '2024-06-01T00:00:00.000Z' });

    const merged = mergeRecords([local], [remote]);

    expect(merged).toHaveLength(1);
    expect(merged[0].deletedAt).toBeTruthy();
  });

  it('resurrects a record edited after a tombstone', () => {
    const local = makeRecord('1', { deletedAt: '2024-01-01T00:00:00.000Z' });
    const remote = makeRecord('1', { updatedAt: '2024-06-01T00:00:00.000Z', notes: 'edited later' });

    const merged = mergeRecords([local], [remote]);

    expect(merged).toHaveLength(1);
    expect(merged[0].deletedAt).toBeUndefined();
    expect(merged[0].notes).toBe('edited later');
  });

  it('keeps the newer tombstone over an older tombstone', () => {
    const local = makeRecord('1', { deletedAt: '2024-01-01T00:00:00.000Z' });
    const remote = makeRecord('1', { deletedAt: '2024-05-01T00:00:00.000Z' });

    const merged = mergeRecords([local], [remote]);

    expect(merged[0].deletedAt).toBe('2024-05-01T00:00:00.000Z');
  });

  it('is symmetric: merging in either order yields the same winner', () => {
    const older = makeRecord('1', { updatedAt: '2024-01-01T00:00:00.000Z', notes: 'old' });
    const newer = makeRecord('1', { updatedAt: '2024-02-01T00:00:00.000Z', notes: 'new' });

    const oneWay = mergeRecords([older], [newer]);
    const otherWay = mergeRecords([newer], [older]);

    expect(oneWay[0].notes).toBe('new');
    expect(otherWay[0].notes).toBe('new');
  });
});
