import { calculateStreaks } from '../streakCalculator';
import { DateTime } from 'luxon';

// Mock DateTime so "today" is always deterministic
jest.mock('luxon', () => {
  const originalLuxon = jest.requireActual('luxon');
  return {
    ...originalLuxon,
    DateTime: {
      ...originalLuxon.DateTime,
      now: jest.fn(() => originalLuxon.DateTime.fromISO('2023-10-15T12:00:00.000Z')),
      fromISO: originalLuxon.DateTime.fromISO,
    },
  };
});

describe('streakCalculator', () => {
  it('returns 0 for empty entries', () => {
    const result = calculateStreaks([], 'daily');
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
  });

  it('ignores uncompleted entries', () => {
    const entries = [
      { date: '2023-10-15', status: 0 },
      { date: '2023-10-14', status: 0 },
    ];
    const result = calculateStreaks(entries, 'daily');
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
  });

  it('calculates current streak when completed today', () => {
    const entries = [
      { date: '2023-10-15', status: 1 },
      { date: '2023-10-14', status: 1 },
      { date: '2023-10-13', status: 1 },
    ];
    const result = calculateStreaks(entries, 'daily');
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  it('calculates current streak when completed yesterday (but not today)', () => {
    const entries = [
      { date: '2023-10-14', status: 1 },
      { date: '2023-10-13', status: 1 },
    ];
    const result = calculateStreaks(entries, 'daily');
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });

  it('breaks streak if older than yesterday', () => {
    const entries = [
      { date: '2023-10-13', status: 1 },
      { date: '2023-10-12', status: 1 },
    ];
    const result = calculateStreaks(entries, 'daily');
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(2);
  });

  it('calculates longest streak correctly with multiple breaks', () => {
    const entries = [
      { date: '2023-10-15', status: 1 },
      { date: '2023-10-14', status: 1 }, // 2 day streak
      
      { date: '2023-10-10', status: 1 },
      { date: '2023-10-09', status: 1 },
      { date: '2023-10-08', status: 1 },
      { date: '2023-10-07', status: 1 }, // 4 day streak (longest)

      { date: '2023-10-01', status: 1 }, // 1 day streak
    ];
    const result = calculateStreaks(entries, 'daily');
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(4);
  });
});
