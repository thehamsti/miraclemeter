import { formatDate, formatDistanceToNow } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format a valid date correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date);

      // Should contain the date parts
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should return "Unknown Date" for null', () => {
      const result = formatDate(null);
      expect(result).toBe('Unknown Date');
    });

    it('should return "Unknown Date" for undefined', () => {
      const result = formatDate(undefined);
      expect(result).toBe('Unknown Date');
    });

    it('should return "Unknown Date" for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      expect(result).toBe('Unknown Date');
    });

    it('should include time in the formatted output', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDate(date);

      // Should contain time (format depends on locale, but should have numbers)
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2024-01-15T00:00:00');
      const result = formatDate(date);

      expect(result).toContain('January');
      expect(result).toContain('15');
    });

    it('should handle end of day correctly', () => {
      const date = new Date('2024-01-15T23:59:59');
      const result = formatDate(date);

      expect(result).toContain('January');
      expect(result).toContain('15');
    });
  });

  describe('formatDistanceToNow', () => {
    // Helper to create dates relative to now
    const createPastDate = (minutes: number = 0, hours: number = 0, days: number = 0): Date => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - minutes);
      date.setHours(date.getHours() - hours);
      date.setDate(date.getDate() - days);
      return date;
    };

    it('should return "just now" for less than 1 minute ago', () => {
      const date = createPastDate(0); // Just now
      const result = formatDistanceToNow(date);
      expect(result).toBe('just now');
    });

    it('should return "1 minute ago" for exactly 1 minute ago', () => {
      const date = createPastDate(1);
      const result = formatDistanceToNow(date);
      expect(result).toBe('1 minute ago');
    });

    it('should return "X minutes ago" for less than 60 minutes', () => {
      const date = createPastDate(30);
      const result = formatDistanceToNow(date);
      expect(result).toBe('30 minutes ago');
    });

    it('should use singular "minute" for 1 minute', () => {
      const date = createPastDate(1);
      const result = formatDistanceToNow(date);
      expect(result).toBe('1 minute ago');
      expect(result).not.toContain('minutes');
    });

    it('should use plural "minutes" for more than 1 minute', () => {
      const date = createPastDate(5);
      const result = formatDistanceToNow(date);
      expect(result).toBe('5 minutes ago');
    });

    it('should return "1 hour ago" for exactly 1 hour ago', () => {
      const date = createPastDate(0, 1);
      const result = formatDistanceToNow(date);
      expect(result).toBe('1 hour ago');
    });

    it('should return "X hours ago" for less than 24 hours', () => {
      const date = createPastDate(0, 5);
      const result = formatDistanceToNow(date);
      expect(result).toBe('5 hours ago');
    });

    it('should use singular "hour" for 1 hour', () => {
      const date = createPastDate(0, 1);
      const result = formatDistanceToNow(date);
      expect(result).toBe('1 hour ago');
      expect(result).not.toContain('hours');
    });

    it('should return "1 day ago" for exactly 1 day ago', () => {
      const date = createPastDate(0, 0, 1);
      const result = formatDistanceToNow(date);
      expect(result).toBe('1 day ago');
    });

    it('should return "X days ago" for less than 30 days', () => {
      const date = createPastDate(0, 0, 15);
      const result = formatDistanceToNow(date);
      expect(result).toBe('15 days ago');
    });

    it('should use singular "day" for 1 day', () => {
      const date = createPastDate(0, 0, 1);
      const result = formatDistanceToNow(date);
      expect(result).toBe('1 day ago');
      expect(result).not.toContain('days');
    });

    it('should return "1 month ago" for exactly 30 days ago', () => {
      const date = createPastDate(0, 0, 30);
      const result = formatDistanceToNow(date);
      expect(result).toBe('1 month ago');
    });

    it('should return "X months ago" for more than 30 days', () => {
      const date = createPastDate(0, 0, 90);
      const result = formatDistanceToNow(date);
      expect(result).toBe('3 months ago');
    });

    it('should use singular "month" for 1 month', () => {
      const date = createPastDate(0, 0, 30);
      const result = formatDistanceToNow(date);
      expect(result).toBe('1 month ago');
      expect(result).not.toContain('months');
    });

    it('should return "Unknown time" for null', () => {
      const result = formatDistanceToNow(null);
      expect(result).toBe('Unknown time');
    });

    it('should return "Unknown time" for undefined', () => {
      const result = formatDistanceToNow(undefined);
      expect(result).toBe('Unknown time');
    });

    it('should return "Unknown time" for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      const result = formatDistanceToNow(invalidDate);
      expect(result).toBe('Unknown time');
    });

    it('should handle boundary between minutes and hours (59 minutes)', () => {
      const date = createPastDate(59);
      const result = formatDistanceToNow(date);
      expect(result).toBe('59 minutes ago');
    });

    it('should handle boundary between hours and days (23 hours)', () => {
      const date = createPastDate(0, 23);
      const result = formatDistanceToNow(date);
      expect(result).toBe('23 hours ago');
    });

    it('should handle boundary between days and months (29 days)', () => {
      const date = createPastDate(0, 0, 29);
      const result = formatDistanceToNow(date);
      expect(result).toBe('29 days ago');
    });
  });
});
