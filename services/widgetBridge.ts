import { NativeModules, Platform } from 'react-native';

const { WidgetBridge } = NativeModules;

export interface PendingWidgetRecord {
  id: string;
  gender: 'boy' | 'girl' | 'angel';
  timestamp: number;
}

/**
 * Updates the widget with current birth record counts.
 * Call this after saving or deleting records.
 */
export async function updateWidgetData(todayCount: number, totalCount: number): Promise<void> {
  if (Platform.OS !== 'ios' || !WidgetBridge) {
    return;
  }

  try {
    WidgetBridge.updateWidgetData(todayCount, totalCount);
  } catch (error) {
    console.error('Error updating widget data:', error);
  }
}

/**
 * Gets a pending birth record that was initiated from the widget.
 * Returns null if no pending record exists.
 */
export async function getPendingWidgetRecord(): Promise<PendingWidgetRecord | null> {
  if (Platform.OS !== 'ios' || !WidgetBridge) {
    return null;
  }

  try {
    const record = await WidgetBridge.getPendingRecord();
    return record as PendingWidgetRecord | null;
  } catch (error) {
    console.error('Error getting pending widget record:', error);
    return null;
  }
}

/**
 * Clears any pending widget record without processing it.
 */
export function clearPendingWidgetRecord(): void {
  if (Platform.OS !== 'ios' || !WidgetBridge) {
    return;
  }

  try {
    WidgetBridge.clearPendingRecord();
  } catch (error) {
    console.error('Error clearing pending widget record:', error);
  }
}

/**
 * Forces the widget to refresh its timeline.
 */
export function refreshWidget(): void {
  if (Platform.OS !== 'ios' || !WidgetBridge) {
    return;
  }

  try {
    WidgetBridge.refreshWidget();
  } catch (error) {
    console.error('Error refreshing widget:', error);
  }
}

/**
 * Helper function to calculate today's count from records.
 */
export function calculateTodayCount(records: Array<{ timestamp?: Date }>): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return records.filter((record) => {
    if (!record.timestamp) return false;
    const recordDate = new Date(record.timestamp);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  }).length;
}
