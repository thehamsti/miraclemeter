import {
  exportToCSV,
  exportToPDF,
  generateExportData,
  getExportSummary,
  ExportError,
} from '../export';
import type { BirthRecord } from '@/types';

describe('Export Service', () => {
  const mockRecord: BirthRecord = {
    id: 'test-id-1',
    timestamp: new Date('2024-01-15T10:30:00'),
    deliveryType: 'vaginal',
    eventType: 'delivery',
    babies: [{ gender: 'boy', birthOrder: 1 }],
    notes: 'Test delivery notes',
  };

  const mockRecords: BirthRecord[] = [
    mockRecord,
    {
      id: 'test-id-2',
      timestamp: new Date('2024-01-16T14:00:00'),
      deliveryType: 'c-section',
      eventType: 'delivery',
      babies: [
        { gender: 'girl', birthOrder: 1 },
        { gender: 'girl', birthOrder: 2 },
      ],
      notes: 'Twin delivery',
    },
    {
      id: 'test-id-3',
      timestamp: new Date('2024-01-17T08:00:00'),
      deliveryType: 'vaginal',
      eventType: 'delivery',
      babies: [{ gender: 'angel', birthOrder: 1 }],
      notes: undefined,
    },
  ];

  describe('exportToCSV', () => {
    it('should generate valid CSV headers', async () => {
      const csv = await exportToCSV([mockRecord]);

      expect(csv).toContain('Date');
      expect(csv).toContain('Time');
      expect(csv).toContain('Delivery Type');
      expect(csv).toContain('Event Type');
      expect(csv).toContain('Number of Babies');
      expect(csv).toContain('Gender(s)');
      expect(csv).toContain('Notes');
    });

    it('should format dates correctly', async () => {
      const csv = await exportToCSV([mockRecord]);

      // Should contain formatted date parts
      expect(csv).toContain('1/15/2024');
    });

    it('should format delivery type with capitalized first letter', async () => {
      const csv = await exportToCSV([mockRecord]);

      expect(csv).toContain('Vaginal');
    });

    it('should handle c-section delivery type', async () => {
      const cSectionRecord = { ...mockRecord, deliveryType: 'c-section' as const };
      const csv = await exportToCSV([cSectionRecord]);

      expect(csv).toContain('C-section');
    });

    it('should handle multiple babies in a record', async () => {
      const twinRecord: BirthRecord = {
        ...mockRecord,
        babies: [
          { gender: 'boy', birthOrder: 1 },
          { gender: 'girl', birthOrder: 2 },
        ],
      };

      const csv = await exportToCSV([twinRecord]);

      expect(csv).toContain('2'); // Number of babies
      expect(csv).toContain('Boy, Girl'); // Gender list
    });

    it('should filter records by date range', async () => {
      const dateRange = {
        start: new Date('2024-01-15T00:00:00'),
        end: new Date('2024-01-16T23:59:59'),
      };

      const csv = await exportToCSV(mockRecords, { dateRange });

      // Should include records from Jan 15 and 16, but not Jan 17
      expect(csv).toContain('1/15/2024');
      expect(csv).toContain('1/16/2024');
      expect(csv).not.toContain('1/17/2024');
    });

    it('should exclude records outside date range', async () => {
      const dateRange = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-14'),
      };

      const csv = await exportToCSV(mockRecords, { dateRange });
      const lines = csv.split('\n');

      // Should only have header row, no data rows
      expect(lines.length).toBe(1);
    });

    it('should sort records newest first', async () => {
      const csv = await exportToCSV(mockRecords);
      const lines = csv.split('\n');

      // Find the data lines (skip header)
      const firstDataLine = lines[1];
      const lastDataLine = lines[lines.length - 1];

      // Jan 17 should come before Jan 15
      expect(firstDataLine).toContain('1/17/2024');
      expect(lastDataLine).toContain('1/15/2024');
    });

    it('should include notes by default', async () => {
      const csv = await exportToCSV([mockRecord]);

      expect(csv).toContain('Notes');
      expect(csv).toContain('Test delivery notes');
    });

    it('should exclude notes when includeNotes is false', async () => {
      const csv = await exportToCSV([mockRecord], { includeNotes: false });

      // Header should not include Notes column
      const headers = csv.split('\n')[0];
      expect(headers).not.toContain('Notes');
    });

    it('should anonymize notes when anonymize is true', async () => {
      const csv = await exportToCSV([mockRecord], { anonymize: true });

      expect(csv).not.toContain('Test delivery notes');
      expect(csv).toContain('[REDACTED]');
    });

    it('should escape quotes in notes for CSV', async () => {
      const recordWithQuotes: BirthRecord = {
        ...mockRecord,
        notes: 'Patient said "everything is fine"',
      };

      const csv = await exportToCSV([recordWithQuotes]);

      // Double quotes should be escaped
      expect(csv).toContain('""everything is fine""');
    });

    it('should handle records without timestamps', async () => {
      const recordWithoutTimestamp: BirthRecord = {
        ...mockRecord,
        timestamp: undefined,
      };

      const csv = await exportToCSV([recordWithoutTimestamp]);

      expect(csv).toContain('Unknown');
    });

    it('should handle empty records array', async () => {
      const csv = await exportToCSV([]);
      const lines = csv.split('\n');

      // Should only have header
      expect(lines.length).toBe(1);
      expect(lines[0]).toContain('Date');
    });

    it('should handle records with undefined delivery type', async () => {
      const recordWithUndefinedType: BirthRecord = {
        ...mockRecord,
        deliveryType: undefined as unknown as 'vaginal',
      };

      const csv = await exportToCSV([recordWithUndefinedType]);

      expect(csv).toContain('Unknown');
    });

    it('should handle records with undefined event type', async () => {
      const recordWithUndefinedEvent: BirthRecord = {
        ...mockRecord,
        eventType: undefined as unknown as 'delivery',
      };

      const csv = await exportToCSV([recordWithUndefinedEvent]);

      expect(csv).toContain('Unknown');
    });

    it('should handle angel gender', async () => {
      const angelRecord: BirthRecord = {
        ...mockRecord,
        babies: [{ gender: 'angel', birthOrder: 1 }],
      };

      const csv = await exportToCSV([angelRecord]);

      expect(csv).toContain('Angel');
    });
  });

  describe('exportToPDF', () => {
    it('should generate PDF content with header', async () => {
      const pdfBytes = await exportToPDF([mockRecord]);
      const content = new TextDecoder().decode(pdfBytes);

      expect(content).toContain('MiracleMeter Birth Records Export');
    });

    it('should include total records count', async () => {
      const pdfBytes = await exportToPDF(mockRecords);
      const content = new TextDecoder().decode(pdfBytes);

      expect(content).toContain('Total Records: 3');
    });

    it('should include record details', async () => {
      const pdfBytes = await exportToPDF([mockRecord]);
      const content = new TextDecoder().decode(pdfBytes);

      expect(content).toContain('Delivery Type: vaginal');
      expect(content).toContain('Event Type: delivery');
      expect(content).toContain('Number of Babies: 1');
      expect(content).toContain('Gender(s): boy');
    });

    it('should filter by date range', async () => {
      const dateRange = {
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T23:59:59'),
      };

      const pdfBytes = await exportToPDF(mockRecords, { dateRange });
      const content = new TextDecoder().decode(pdfBytes);

      expect(content).toContain('Total Records: 1');
    });

    it('should include notes by default', async () => {
      const pdfBytes = await exportToPDF([mockRecord]);
      const content = new TextDecoder().decode(pdfBytes);

      expect(content).toContain('Notes: Test delivery notes');
    });

    it('should anonymize notes when requested', async () => {
      const pdfBytes = await exportToPDF([mockRecord], { anonymize: true });
      const content = new TextDecoder().decode(pdfBytes);

      expect(content).not.toContain('Test delivery notes');
      expect(content).toContain('[REDACTED]');
    });

    it('should exclude notes when includeNotes is false', async () => {
      const pdfBytes = await exportToPDF([mockRecord], { includeNotes: false });
      const content = new TextDecoder().decode(pdfBytes);

      expect(content).not.toContain('Notes:');
    });

    it('should handle records without notes', async () => {
      const recordWithoutNotes: BirthRecord = {
        ...mockRecord,
        notes: undefined,
      };

      const pdfBytes = await exportToPDF([recordWithoutNotes]);
      const content = new TextDecoder().decode(pdfBytes);

      // Should still generate without error
      expect(content).toContain('MiracleMeter');
    });

    it('should return Uint8Array', async () => {
      const pdfBytes = await exportToPDF([mockRecord]);

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
    });
  });

  describe('generateExportData', () => {
    it('should generate CSV export data', async () => {
      const result = await generateExportData([mockRecord], { format: 'csv' });

      expect(result.mimeType).toBe('text/csv');
      expect(result.fileName).toMatch(/miraclemeter-export-.*\.csv/);
      expect(result.content).toContain('Date');
    });

    it('should generate PDF export data', async () => {
      const result = await generateExportData([mockRecord], { format: 'pdf' });

      expect(result.mimeType).toBe('application/pdf');
      expect(result.fileName).toMatch(/miraclemeter-export-.*\.pdf/);
      expect(result.content).toContain('MiracleMeter');
    });

    it('should include date in filename', async () => {
      const result = await generateExportData([mockRecord], { format: 'csv' });

      // Should contain ISO date format
      expect(result.fileName).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should throw ExportError for unsupported format', async () => {
      await expect(
        // @ts-expect-error Testing invalid format
        generateExportData([mockRecord], { format: 'xml' })
      ).rejects.toThrow(ExportError);
    });

    it('should pass options to CSV export', async () => {
      const result = await generateExportData([mockRecord], {
        format: 'csv',
        anonymize: true,
      });

      expect(result.content).toContain('[REDACTED]');
    });
  });

  describe('getExportSummary', () => {
    it('should return correct total records count', () => {
      const summary = getExportSummary(mockRecords);

      expect(summary.totalRecords).toBe(3);
    });

    it('should return correct babies count', () => {
      const summary = getExportSummary(mockRecords);

      // 1 + 2 + 1 = 4 babies
      expect(summary.babiesCount).toBe(4);
    });

    it('should count delivery types correctly', () => {
      const summary = getExportSummary(mockRecords);

      expect(summary.deliveryTypes.vaginal).toBe(2);
      expect(summary.deliveryTypes['c-section']).toBe(1);
    });

    it('should count genders correctly', () => {
      const summary = getExportSummary(mockRecords);

      expect(summary.genderCounts.boy).toBe(1);
      expect(summary.genderCounts.girl).toBe(2);
      expect(summary.genderCounts.angel).toBe(1);
    });

    it('should filter by date range', () => {
      const dateRange = {
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T23:59:59'),
      };

      const summary = getExportSummary(mockRecords, { dateRange });

      expect(summary.totalRecords).toBe(1);
      expect(summary.babiesCount).toBe(1);
    });

    it('should calculate actual date range', () => {
      const summary = getExportSummary(mockRecords);

      expect(summary.dateRange).toBeDefined();
      expect(summary.dateRange?.start).toEqual(new Date('2024-01-15T10:30:00'));
      expect(summary.dateRange?.end).toEqual(new Date('2024-01-17T08:00:00'));
    });

    it('should return undefined date range for empty records', () => {
      const summary = getExportSummary([]);

      expect(summary.dateRange).toBeUndefined();
    });

    it('should handle records without timestamps', () => {
      const recordsWithoutTimestamps: BirthRecord[] = [
        { ...mockRecord, timestamp: undefined },
      ];

      const summary = getExportSummary(recordsWithoutTimestamps);

      // Should still count the record
      expect(summary.totalRecords).toBe(1);
      expect(summary.babiesCount).toBe(1);
    });

    it('should handle empty babies array', () => {
      const recordWithNoBabies: BirthRecord[] = [
        { ...mockRecord, babies: [] },
      ];

      const summary = getExportSummary(recordWithNoBabies);

      expect(summary.totalRecords).toBe(1);
      expect(summary.babiesCount).toBe(0);
    });

    it('should handle unknown delivery type', () => {
      const recordWithUnknownType: BirthRecord[] = [
        { ...mockRecord, deliveryType: undefined as unknown as 'vaginal' },
      ];

      const summary = getExportSummary(recordWithUnknownType);

      expect(summary.deliveryTypes.unknown).toBe(1);
    });

    it('should exclude records without timestamps from date range filter', () => {
      const recordsWithMixed: BirthRecord[] = [
        mockRecord,
        { ...mockRecord, id: 'no-timestamp', timestamp: undefined },
      ];

      const dateRange = {
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T23:59:59'),
      };

      const summary = getExportSummary(recordsWithMixed, { dateRange });

      // Only the record with timestamp should be included
      expect(summary.totalRecords).toBe(1);
    });
  });

  describe('ExportError', () => {
    it('should have correct name', () => {
      const error = new ExportError('Test error');
      expect(error.name).toBe('ExportError');
    });

    it('should have correct message', () => {
      const error = new ExportError('Test error message');
      expect(error.message).toBe('Test error message');
    });

    it('should store cause when provided', () => {
      const cause = new Error('Original error');
      const error = new ExportError('Wrapped error', cause);
      expect(error.cause).toBe(cause);
    });

    it('should be instanceof Error', () => {
      const error = new ExportError('Test');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
