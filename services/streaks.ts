import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StreakData } from '@/types';

const STREAK_STORAGE_KEY = 'streak_data';
const MAX_SHIELDS = 3;
const RECOVERY_DAYS = 7;
const RECOVERY_TARGET_LOGS = 3;

// Milestone weeks that trigger celebrations
export const STREAK_MILESTONES = [4, 12, 26, 52, 104, 156] as const;

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
  streakSaveUsedAt: null, // Deprecated
};

// Get ISO date string for local date
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get the Monday of the week containing the given date
function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return getLocalDateString(d);
}

// Get the Sunday of the week containing the given date
function getWeekEnd(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day); // Sunday
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return getLocalDateString(d);
}

// Check if two dates are in the same week
function isSameWeek(date1: string, date2: string): boolean {
  return getWeekStart(new Date(date1)) === getWeekStart(new Date(date2));
}

// Get number of weeks between two dates
function getWeeksBetween(startDate: string, endDate: string): number {
  const start = new Date(getWeekStart(new Date(startDate)));
  const end = new Date(getWeekStart(new Date(endDate)));
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
}

// Check if date is past
function isDatePast(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export async function getStreakData(): Promise<StreakData> {
  try {
    const data = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (!data) return DEFAULT_STREAK_DATA;
    
    const parsed = JSON.parse(data);
    // Migrate old data format if needed
    return migrateStreakData(parsed);
  } catch (error) {
    console.error('Error loading streak data:', error);
    return DEFAULT_STREAK_DATA;
  }
}

// Migrate from old daily-based system to weekly system
function migrateStreakData(data: Partial<StreakData>): StreakData {
  return {
    currentStreak: data.currentStreak ?? 0,
    longestStreak: data.longestStreak ?? 0,
    lastLogDate: data.lastLogDate ?? null,
    weeklyGoal: data.weeklyGoal ?? 1,
    currentWeekLogs: data.currentWeekLogs ?? 0,
    weekStartDate: data.weekStartDate ?? null,
    streakShields: data.streakShields ?? 0,
    recoveryChallenge: data.recoveryChallenge ?? null,
    milestonesCelebrated: data.milestonesCelebrated ?? [],
    streakSaveUsedAt: data.streakSaveUsedAt ?? null,
  };
}

export async function saveStreakData(data: StreakData): Promise<void> {
  try {
    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving streak data:', error);
    throw error;
  }
}

// Main function called when a delivery is logged
export async function updateStreakOnDelivery(): Promise<{
  streakData: StreakData;
  newMilestone: number | null;
  shieldEarned: boolean;
  recoveryCompleted: boolean;
}> {
  const today = getLocalDateString();
  const currentWeekStart = getWeekStart();
  let streakData = await getStreakData();
  let newMilestone: number | null = null;
  let shieldEarned = false;
  let recoveryCompleted = false;

  // Already logged today - increment week count but no other changes
  if (streakData.lastLogDate === today) {
    return { streakData, newMilestone: null, shieldEarned: false, recoveryCompleted: false };
  }

  // Check if we're in a new week
  const isNewWeek = !streakData.weekStartDate || 
    getWeekStart(new Date(streakData.weekStartDate)) !== currentWeekStart;

  if (isNewWeek) {
    // Process the previous week before starting new one
    streakData = await processWeekTransition(streakData, currentWeekStart);
  }

  // Update current week tracking
  streakData.currentWeekLogs += 1;
  streakData.lastLogDate = today;
  streakData.weekStartDate = currentWeekStart;

  // Check if weekly goal was just met (first time this week)
  const justMetGoal = streakData.currentWeekLogs === streakData.weeklyGoal;
  const exceededGoal = streakData.currentWeekLogs > streakData.weeklyGoal;

  if (justMetGoal && streakData.currentStreak === 0) {
    // Starting a new streak
    streakData.currentStreak = 1;
    streakData.longestStreak = Math.max(streakData.longestStreak, 1);
  }

  // Earn a shield for exceeding weekly goal (once per week, max 3)
  if (exceededGoal && streakData.currentWeekLogs === streakData.weeklyGoal + 1) {
    if (streakData.streakShields < MAX_SHIELDS) {
      streakData.streakShields += 1;
      shieldEarned = true;
    }
  }

  // Check recovery challenge progress
  if (streakData.recoveryChallenge?.active) {
    streakData.recoveryChallenge.currentLogs += 1;
    
    if (streakData.recoveryChallenge.currentLogs >= streakData.recoveryChallenge.targetLogs) {
      // Recovery completed! Restore the streak
      streakData.currentStreak = streakData.recoveryChallenge.originalStreak;
      streakData.recoveryChallenge = null;
      recoveryCompleted = true;
    }
  }

  // Check for milestone celebrations
  newMilestone = checkForNewMilestone(streakData);
  if (newMilestone) {
    streakData.milestonesCelebrated.push(newMilestone);
    // Earn a shield for hitting milestones
    if (streakData.streakShields < MAX_SHIELDS) {
      streakData.streakShields += 1;
      shieldEarned = true;
    }
  }

  await saveStreakData(streakData);
  return { streakData, newMilestone, shieldEarned, recoveryCompleted };
}

// Handle the transition from one week to the next
async function processWeekTransition(
  streakData: StreakData,
  newWeekStart: string
): Promise<StreakData> {
  // If no previous week data, just start fresh
  if (!streakData.weekStartDate) {
    return {
      ...streakData,
      currentWeekLogs: 0,
      weekStartDate: newWeekStart,
    };
  }

  const previousWeekStart = streakData.weekStartDate;
  const weeksBetween = getWeeksBetween(previousWeekStart, newWeekStart);

  // Check if previous week met the goal
  const metGoalLastWeek = streakData.currentWeekLogs >= streakData.weeklyGoal;

  if (weeksBetween === 1) {
    // Consecutive week
    if (metGoalLastWeek) {
      // Previous week was active, increment streak
      streakData.currentStreak += 1;
      streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
    } else {
      // Missed goal last week
      streakData = handleMissedWeek(streakData);
    }
  } else if (weeksBetween > 1) {
    // Skipped one or more weeks
    // First, handle the week they were tracking (if not met)
    if (!metGoalLastWeek) {
      streakData = handleMissedWeek(streakData);
    } else {
      // They met the goal but then skipped weeks
      // Use shields for the gap weeks or break streak
      for (let i = 1; i < weeksBetween; i++) {
        if (streakData.streakShields > 0) {
          streakData.streakShields -= 1;
        } else {
          streakData = handleMissedWeek(streakData);
          break;
        }
      }
    }
  }

  // Reset for new week
  streakData.currentWeekLogs = 0;
  streakData.weekStartDate = newWeekStart;

  return streakData;
}

// Handle a missed week (goal not met)
function handleMissedWeek(streakData: StreakData): StreakData {
  // Try to use a shield
  if (streakData.streakShields > 0) {
    streakData.streakShields -= 1;
    return streakData;
  }

  // No shield - check if recovery challenge is available
  if (streakData.currentStreak > 0 && !streakData.recoveryChallenge) {
    // Start recovery challenge
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + RECOVERY_DAYS);
    
    streakData.recoveryChallenge = {
      active: true,
      targetLogs: RECOVERY_TARGET_LOGS,
      currentLogs: 0,
      deadline: getLocalDateString(deadline),
      originalStreak: streakData.currentStreak,
    };
  }

  // Break the streak
  streakData.currentStreak = 0;
  return streakData;
}

// Check if a new milestone was just reached
function checkForNewMilestone(streakData: StreakData): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (
      streakData.currentStreak >= milestone &&
      !streakData.milestonesCelebrated.includes(milestone)
    ) {
      return milestone;
    }
  }
  return null;
}

// Check and update streak status (call on app open)
export async function checkAndUpdateStreakStatus(): Promise<StreakData> {
  let streakData = await getStreakData();
  const today = getLocalDateString();
  const currentWeekStart = getWeekStart();

  // Check if recovery challenge expired
  if (
    streakData.recoveryChallenge?.active &&
    streakData.recoveryChallenge.deadline &&
    isDatePast(streakData.recoveryChallenge.deadline)
  ) {
    // Recovery failed
    streakData.recoveryChallenge = null;
    await saveStreakData(streakData);
  }

  // Check for week transition
  if (streakData.weekStartDate && streakData.weekStartDate !== currentWeekStart) {
    streakData = await processWeekTransition(streakData, currentWeekStart);
    await saveStreakData(streakData);
  }

  return streakData;
}

// Get streak status info for UI
export function getStreakStatus(streakData: StreakData): {
  isGoalMet: boolean;
  isAtRisk: boolean;
  logsRemaining: number;
  daysLeftInWeek: number;
  hasRecoveryChallenge: boolean;
  recoveryProgress: { current: number; target: number } | null;
} {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysLeftInWeek = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  
  const isGoalMet = streakData.currentWeekLogs >= streakData.weeklyGoal;
  const logsRemaining = Math.max(0, streakData.weeklyGoal - streakData.currentWeekLogs);
  
  // At risk if goal not met and it's late in the week (Thursday or later)
  const isAtRisk = !isGoalMet && daysLeftInWeek <= 3 && streakData.currentStreak > 0;

  const hasRecoveryChallenge = streakData.recoveryChallenge?.active ?? false;
  const recoveryProgress = streakData.recoveryChallenge
    ? {
        current: streakData.recoveryChallenge.currentLogs,
        target: streakData.recoveryChallenge.targetLogs,
      }
    : null;

  return {
    isGoalMet,
    isAtRisk,
    logsRemaining,
    daysLeftInWeek,
    hasRecoveryChallenge,
    recoveryProgress,
  };
}

// Update weekly goal setting
export async function setWeeklyGoal(goal: number): Promise<StreakData> {
  const streakData = await getStreakData();
  streakData.weeklyGoal = Math.max(1, Math.min(7, goal)); // Clamp 1-7
  await saveStreakData(streakData);
  return streakData;
}

// Cancel recovery challenge (user gives up)
export async function cancelRecoveryChallenge(): Promise<StreakData> {
  const streakData = await getStreakData();
  streakData.recoveryChallenge = null;
  await saveStreakData(streakData);
  return streakData;
}

// Get shield count
export function getShieldCount(streakData: StreakData): number {
  return streakData.streakShields;
}

// Check if user can manually use a shield (for UI)
export function canUseShield(streakData: StreakData): boolean {
  return streakData.streakShields > 0 && streakData.currentStreak > 0;
}

// Get days until end of current week
export function getDaysUntilWeekEnd(): number {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

// Get week progress for visualization
export function getWeekProgress(streakData: StreakData): {
  goal: number;
  current: number;
  percentage: number;
} {
  const goal = streakData.weeklyGoal;
  const current = streakData.currentWeekLogs;
  const percentage = Math.min(100, Math.round((current / goal) * 100));
  return { goal, current, percentage };
}

// Get milestone info for UI
export function getNextMilestone(currentStreak: number): {
  milestone: number;
  weeksAway: number;
} | null {
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak < milestone) {
      return {
        milestone,
        weeksAway: milestone - currentStreak,
      };
    }
  }
  return null;
}

// Reset all streak data (for testing/debugging)
export async function resetStreakData(): Promise<void> {
  await saveStreakData(DEFAULT_STREAK_DATA);
}

// Legacy compatibility functions
export function canUseStreakSave(_streakData: StreakData): boolean {
  // Deprecated - shields replace this
  return false;
}

export async function useStreakSave(): Promise<StreakData | null> {
  // Deprecated - shields replace this
  return null;
}

export function isStreakAtRisk(streakData: StreakData): boolean {
  const status = getStreakStatus(streakData);
  return status.isAtRisk;
}

export function isStreakBroken(_streakData: StreakData): boolean {
  // With weekly system, this is handled differently
  return false;
}
