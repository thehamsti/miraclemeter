import { RefObject } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import type { Achievement } from '@/types';
import type { StatsPeriod } from '@/components/StatsShareCard';

export class ShareError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ShareError';
  }
}

export async function captureAndShareAchievement(
  viewRef: RefObject<View>,
  achievement: Achievement
): Promise<void> {
  try {
    if (!viewRef.current) {
      throw new ShareError('View reference is not available');
    }

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new ShareError('Sharing is not available on this device');
    }

    // Capture the view as an image
    const tempUri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    // Create a friendly filename and move the file
    const friendlyName = `${achievement.name.replace(/[^a-zA-Z0-9]/g, '-')}-Achievement.png`;
    const tempFile = new File(tempUri);
    const friendlyFile = new File(Paths.cache, friendlyName);
    tempFile.move(friendlyFile);
    const friendlyUri = friendlyFile.uri;

    // Share the image
    await Sharing.shareAsync(friendlyUri, {
      mimeType: 'image/png',
      dialogTitle: `Share ${achievement.name} Achievement`,
      UTI: 'public.png',
    });
  } catch (error) {
    console.error('Error sharing achievement:', error);
    if (error instanceof ShareError) {
      throw error;
    }
    throw new ShareError(
      'Failed to share achievement',
      error instanceof Error ? error : undefined
    );
  }
}

export async function isShareAvailable(): Promise<boolean> {
  try {
    return await Sharing.isAvailableAsync();
  } catch {
    return false;
  }
}

const PERIOD_LABELS: Record<StatsPeriod, string> = {
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
  lifetime: 'Lifetime',
};

export async function captureAndShareStats(
  viewRef: RefObject<View>,
  period: StatsPeriod
): Promise<void> {
  try {
    if (!viewRef.current) {
      throw new ShareError('View reference is not available');
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new ShareError('Sharing is not available on this device');
    }

    const tempUri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    const friendlyName = `MiracleMeter-${PERIOD_LABELS[period]}-Stats.png`;
    const tempFile = new File(tempUri);
    const friendlyFile = new File(Paths.cache, friendlyName);
    tempFile.move(friendlyFile);
    const friendlyUri = friendlyFile.uri;

    await Sharing.shareAsync(friendlyUri, {
      mimeType: 'image/png',
      dialogTitle: `Share ${PERIOD_LABELS[period]} Stats`,
      UTI: 'public.png',
    });
  } catch (error) {
    console.error('Error sharing stats:', error);
    if (error instanceof ShareError) {
      throw error;
    }
    throw new ShareError(
      'Failed to share stats',
      error instanceof Error ? error : undefined
    );
  }
}
