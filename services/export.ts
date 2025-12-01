import { BirthRecord } from '@/types';

export interface ExportOptions {
  format: 'csv' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeNotes?: boolean;
  anonymize?: boolean;
}

export class ExportError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ExportError';
  }
}

/**
 * Export birth records to CSV format
 */
export async function exportToCSV(
  records: BirthRecord[],
  options: Partial<ExportOptions> = {}
): Promise<string> {
  try {
    const {
      dateRange,
      includeNotes = true,
      anonymize = false,
    } = options;

    // Filter records by date range if specified
    let filteredRecords = records;
    if (dateRange) {
      filteredRecords = records.filter(record => {
        if (!record.timestamp) return false;
        const recordDate = new Date(record.timestamp);
        return recordDate >= dateRange.start && recordDate <= dateRange.end;
      });
    }

    // Sort records by date (newest first)
    filteredRecords.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    });

    // Generate CSV headers
    const headers = [
      'Date',
      'Time',
      'Delivery Type',
      'Event Type',
      'Number of Babies',
      'Gender(s)',
      ...(includeNotes ? ['Notes'] : []),
    ];

    // Generate CSV rows
    const rows = filteredRecords.map(record => {
      const date = record.timestamp 
        ? new Date(record.timestamp).toLocaleDateString('en-US')
        : 'Unknown';
      
      const time = record.timestamp
        ? new Date(record.timestamp).toLocaleTimeString('en-US')
        : 'Unknown';

      const deliveryType = record.deliveryType 
        ? record.deliveryType.charAt(0).toUpperCase() + record.deliveryType.slice(1)
        : 'Unknown';

      const eventType = record.eventType 
        ? record.eventType.charAt(0).toUpperCase() + record.eventType.slice(1)
        : 'Unknown';

      const genders = record.babies
        .map(baby => baby.gender.charAt(0).toUpperCase() + baby.gender.slice(1))
        .join(', ');

      const notes = includeNotes && record.notes
        ? anonymize 
          ? '[REDACTED]' 
          : `"${record.notes.replace(/"/g, '""')}"` // Escape quotes in CSV
        : '';

      return [
        date,
        time,
        deliveryType,
        eventType,
        record.babies.length.toString(),
        genders,
        ...(includeNotes ? [notes] : []),
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  } catch (error) {
    throw new ExportError('Failed to generate CSV export', error instanceof Error ? error : undefined);
  }
}

/**
 * Export birth records to PDF format (placeholder implementation)
 * Note: This would require a PDF library like react-native-pdf-lib
 */
export async function exportToPDF(
  records: BirthRecord[],
  options: Partial<ExportOptions> = {}
): Promise<Uint8Array> {
  try {
    // For now, we'll create a simple text-based PDF-like content
    // In a real implementation, you would use a PDF library
    const {
      dateRange,
      includeNotes = true,
      anonymize = false,
    } = options;

    // Filter records by date range if specified
    let filteredRecords = records;
    if (dateRange) {
      filteredRecords = records.filter(record => {
        if (!record.timestamp) return false;
        const recordDate = new Date(record.timestamp);
        return recordDate >= dateRange.start && recordDate <= dateRange.end;
      });
    }

    // Sort records by date (newest first)
    filteredRecords.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    });

    // Generate PDF content (simplified text format)
    let pdfContent = 'MiracleMeter Birth Records Export\n';
    pdfContent += `Generated: ${new Date().toLocaleString()}\n`;
    pdfContent += `Total Records: ${filteredRecords.length}\n`;
    pdfContent += '=' .repeat(50) + '\n\n';

    filteredRecords.forEach((record, index) => {
      pdfContent += `Record ${index + 1}\n`;
      pdfContent += `Date: ${record.timestamp ? new Date(record.timestamp).toLocaleDateString() : 'Unknown'}\n`;
      pdfContent += `Time: ${record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : 'Unknown'}\n`;
      pdfContent += `Delivery Type: ${record.deliveryType || 'Unknown'}\n`;
      pdfContent += `Event Type: ${record.eventType || 'Unknown'}\n`;
      pdfContent += `Number of Babies: ${record.babies.length}\n`;
      pdfContent += `Gender(s): ${record.babies.map(b => b.gender).join(', ')}\n`;
      
      if (includeNotes && record.notes) {
        pdfContent += `Notes: ${anonymize ? '[REDACTED]' : record.notes}\n`;
      }
      
      pdfContent += '\n' + '-'.repeat(30) + '\n\n';
    });

    // Convert to Uint8Array (in real implementation, this would be actual PDF binary data)
    const encoder = new TextEncoder();
    return encoder.encode(pdfContent);
  } catch (error) {
    throw new ExportError('Failed to generate PDF export', error instanceof Error ? error : undefined);
  }
}

/**
 * Generate export data for sharing (returns content that can be shared)
 * Note: In a full implementation, you would integrate with expo-sharing and expo-file-system
 */
export async function generateExportData(
  records: BirthRecord[],
  options: ExportOptions
): Promise<{
  content: string;
  fileName: string;
  mimeType: string;
}> {
  try {
    const { format } = options;
    
    let content: string;
    let fileName: string;
    let mimeType: string;

    if (format === 'csv') {
      content = await exportToCSV(records, options);
      fileName = `miraclemeter-export-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'pdf') {
      const pdfBytes = await exportToPDF(records, options);
      content = Array.from(pdfBytes).map(b => String.fromCharCode(b)).join('');
      fileName = `miraclemeter-export-${new Date().toISOString().split('T')[0]}.pdf`;
      mimeType = 'application/pdf';
    } else {
      throw new ExportError(`Unsupported export format: ${format}`);
    }

    return {
      content,
      fileName,
      mimeType,
    };
  } catch (error) {
    if (error instanceof ExportError) {
      throw error;
    }
    throw new ExportError('Failed to generate export data', error instanceof Error ? error : undefined);
  }
}

/**
 * Share exported data with user (placeholder implementation)
 * Note: This would require expo-sharing and expo-file-system packages
 */
export async function shareExport(
  records: BirthRecord[],
  options: ExportOptions
): Promise<void> {
  try {
    const exportData = await generateExportData(records, options);
    
    // For now, just log the export data
    // In a real implementation, you would:
    // 1. Save to file using expo-file-system
    // 2. Share using expo-sharing
    console.log('Export generated:', exportData.fileName);
    console.log('Content length:', exportData.content.length);
    console.log('First 200 characters:', exportData.content.substring(0, 200));
    
    // Throw error to indicate sharing needs to be implemented
    throw new ExportError('File sharing not implemented - requires expo-sharing and expo-file-system packages');
  } catch (error) {
    if (error instanceof ExportError) {
      throw error;
    }
    throw new ExportError('Failed to share export', error instanceof Error ? error : undefined);
  }
}

/**
 * Get export summary information
 */
export function getExportSummary(
  records: BirthRecord[],
  options: Partial<ExportOptions> = {}
): {
  totalRecords: number;
  dateRange?: { start: Date; end: Date };
  babiesCount: number;
  deliveryTypes: Record<string, number>;
  genderCounts: Record<string, number>;
} {
  const { dateRange } = options;

  // Filter records by date range if specified
  let filteredRecords = records;
  if (dateRange) {
    filteredRecords = records.filter(record => {
      if (!record.timestamp) return false;
      const recordDate = new Date(record.timestamp);
      return recordDate >= dateRange.start && recordDate <= dateRange.end;
    });
  }

  // Calculate statistics
  const deliveryTypes: Record<string, number> = {};
  const genderCounts: Record<string, number> = {};
  let babiesCount = 0;

  filteredRecords.forEach(record => {
    // Count delivery types
    const deliveryType = record.deliveryType || 'unknown';
    deliveryTypes[deliveryType] = (deliveryTypes[deliveryType] || 0) + 1;

    // Count babies and genders
    record.babies.forEach(baby => {
      babiesCount++;
      genderCounts[baby.gender] = (genderCounts[baby.gender] || 0) + 1;
    });
  });

  // Determine actual date range
  const actualDateRange = filteredRecords.length > 0
    ? {
        start: new Date(Math.min(...filteredRecords
          .filter(r => r.timestamp)
          .map(r => new Date(r.timestamp!).getTime()))),
        end: new Date(Math.max(...filteredRecords
          .filter(r => r.timestamp)
          .map(r => new Date(r.timestamp!).getTime()))),
      }
    : undefined;

  return {
    totalRecords: filteredRecords.length,
    dateRange: actualDateRange,
    babiesCount,
    deliveryTypes,
    genderCounts,
  };
}