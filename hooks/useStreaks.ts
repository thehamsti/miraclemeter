import { useState, useEffect, useCallback } from 'react';
import type { StreakData } from '@/types';
import {
  getStreakData,
  checkAndUpdateStreakStatus,
  getStreakStatus,
  getWeekProgress,
  getNextMilestone,
  setWeeklyGoal,
  cancelRecoveryChallenge,
  STREAK_MILESTONES,
} from '@/services/streaks';

const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastLogDate: null,
  weeklyGoal: 1,
  currentWeekLogs: 0,
  weekStartDate: null,
  streakShields: 0,
  recoveryChallenge: null,
  milestonesCelebrated: [],
  streakSaveUsedAt: null,
};

interface StreakStatus {
  isGoalMet: boolean;
  isAtRisk: boolean;
  logsRemaining: number;
  daysLeftInWeek: number;
  hasRecoveryChallenge: boolean;
  recoveryProgress: { current: number; target: number } | null;
}

interface WeekProgress {
  goal: number;
  current: number;
  percentage: number;
}

interface NextMilestone {
  milestone: number;
  weeksAway: number;
}

interface UseStreaksResult {
  streakData: StreakData;
  loading: boolean;
  
  // Status helpers
  status: StreakStatus;
  weekProgress: WeekProgress;
  nextMilestone: NextMilestone | null;
  
  // Legacy compatibility
  isAtRisk: boolean;
  canSaveStreak: boolean;
  
  // Actions
  refresh: () => Promise<void>;
  updateWeeklyGoal: (goal: number) => Promise<void>;
  abandonRecovery: () => Promise<void>;
  
  // Deprecated
  saveStreak: () => Promise<boolean>;
}

export function useStreaks(): UseStreaksResult {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK_DATA);
  const [loading, setLoading] = useState(true);

  const loadStreakData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await checkAndUpdateStreakStatus();
      setStreakData(data);
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  const refresh = useCallback(async () => {
    await loadStreakData();
  }, [loadStreakData]);

  const updateWeeklyGoal = useCallback(async (goal: number) => {
    const updated = await setWeeklyGoal(goal);
    setStreakData(updated);
  }, []);

  const abandonRecovery = useCallback(async () => {
    const updated = await cancelRecoveryChallenge();
    setStreakData(updated);
  }, []);

  // Deprecated - kept for backward compatibility
  const saveStreak = useCallback(async (): Promise<boolean> => {
    return false;
  }, []);

  // Computed values
  const status = getStreakStatus(streakData);
  const weekProgress = getWeekProgress(streakData);
  const nextMilestone = getNextMilestone(streakData.currentStreak);
  
  // Legacy compatibility
  const isAtRisk = status.isAtRisk;
  const canSaveStreak = false; // Deprecated, shields replace this

  return {
    streakData,
    loading,
    status,
    weekProgress,
    nextMilestone,
    isAtRisk,
    canSaveStreak,
    refresh,
    updateWeeklyGoal,
    abandonRecovery,
    saveStreak,
  };
}

export { STREAK_MILESTONES };
