import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';
import type { StreakData } from '@/types';

interface StreakProgressCardProps {
  streakData: StreakData;
  status: {
    isGoalMet: boolean;
    isAtRisk: boolean;
    logsRemaining: number;
    daysLeftInWeek: number;
    hasRecoveryChallenge: boolean;
    recoveryProgress: { current: number; target: number } | null;
  };
  weekProgress: {
    goal: number;
    current: number;
    percentage: number;
  };
  nextMilestone: { milestone: number; weeksAway: number } | null;
  loggedDates?: Set<string>;
  onPress?: () => void;
  onDayPress?: (date: Date) => void;
}

// Get dates for the current week (Monday to Sunday)
function getCurrentWeekDates(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Day labels for the week
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakProgressCard({
  streakData,
  status,
  weekProgress,
  nextMilestone,
  loggedDates,
  onPress,
  onDayPress,
}: StreakProgressCardProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');

  const progressAnim = useRef(new Animated.Value(0)).current;
  const shieldPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: weekProgress.percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Pulse shields if at risk
    if (status.isAtRisk && streakData.streakShields > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shieldPulse, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(shieldPulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [weekProgress.percentage, status.isAtRisk, streakData.streakShields]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const getStatusMessage = (): string => {
    if (status.hasRecoveryChallenge && status.recoveryProgress) {
      const { current, target } = status.recoveryProgress;
      return `Recovery: ${current}/${target} logs to restore streak`;
    }
    if (status.isGoalMet) {
      // Check if they can still earn a shield this week
      const canEarnShield = weekProgress.current === weekProgress.goal && streakData.streakShields < 3;
      if (canEarnShield) {
        return 'Goal complete! Log 1 more to earn a shield';
      }
      const earnedShieldThisWeek = weekProgress.current > weekProgress.goal;
      if (earnedShieldThisWeek && streakData.streakShields < 3) {
        return 'Shield earned this week!';
      }
      return 'Weekly goal complete!';
    }
    if (status.isAtRisk) {
      return `${status.logsRemaining} more log${status.logsRemaining > 1 ? 's' : ''} needed this week`;
    }
    if (status.logsRemaining > 0) {
      return `${status.logsRemaining} log${status.logsRemaining > 1 ? 's' : ''} to hit your goal`;
    }
    return 'Keep up the great work!';
  };

  const getProgressColor = (): string => {
    if (status.hasRecoveryChallenge) return warningColor;
    if (status.isGoalMet) return successColor;
    if (status.isAtRisk) return warningColor;
    return primaryColor;
  };

  // Get current day of week (0 = Monday in our display)
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 6 : today - 1; // Convert Sunday=0 to Sunday=6

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: surfaceColor },
        pressed && styles.pressed,
      ]}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.streakBadge}>
          <LinearGradient
            colors={
              status.isAtRisk
                ? ['#F59E0B', '#EF4444']
                : status.isGoalMet
                ? [successColor, '#059669']
                : ['#FF6B35', '#F7931E']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakBadgeGradient}
          >
            <MaterialCommunityIcons name="fire" size={20} color="white" />
            <ThemedText style={styles.streakCount}>
              {streakData.currentStreak}
            </ThemedText>
          </LinearGradient>
          <ThemedText style={[styles.streakLabel, { color: textSecondaryColor }]}>
            {streakData.currentStreak === 1 ? 'week' : 'weeks'}
          </ThemedText>
        </View>

        {/* Shields */}
        <Animated.View
          style={[
            styles.shieldsContainer,
            { transform: [{ scale: shieldPulse }] },
          ]}
        >
          {[0, 1, 2].map((i) => {
            const isEarned = i < streakData.streakShields;
            // Show "earning" state for next shield when goal is met
            const isEarning = !isEarned && 
              i === streakData.streakShields && 
              status.isGoalMet && 
              weekProgress.current === weekProgress.goal &&
              streakData.streakShields < 3;
            
            return (
              <View
                key={i}
                style={[
                  styles.shieldIcon,
                  {
                    opacity: isEarned ? 1 : isEarning ? 0.6 : 0.25,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={isEarning ? 'shield-plus' : 'shield'}
                  size={18}
                  color={isEarned ? '#3B82F6' : isEarning ? successColor : textSecondaryColor}
                />
              </View>
            );
          })}
        </Animated.View>
      </View>

      {/* Week Progress */}
      <View style={styles.weekProgressSection}>
        <View style={styles.weekDays}>
          {getCurrentWeekDates().map((date, i) => {
            const isToday = i === currentDayIndex;
            const isPast = i < currentDayIndex;
            const dateKey = formatDateKey(date);
            const isLogged = loggedDates?.has(dateKey) ?? false;
            const isClickable = isLogged && onDayPress;

            const dayContent = (
              <View
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: isLogged
                      ? getProgressColor() + '20'
                      : 'transparent',
                    borderColor: isToday
                      ? primaryColor
                      : isPast
                      ? textSecondaryColor + '30'
                      : textSecondaryColor + '20',
                    borderWidth: isToday ? 2 : 1,
                  },
                ]}
              >
                {isLogged && (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={getProgressColor()}
                  />
                )}
                {!isLogged && (
                  <ThemedText
                    style={[
                      styles.dayText,
                      {
                        color: isToday ? primaryColor : textSecondaryColor,
                        fontWeight: isToday ? '700' : '500',
                      },
                    ]}
                  >
                    {DAYS[i]}
                  </ThemedText>
                )}
              </View>
            );

            if (isClickable) {
              return (
                <Pressable
                  key={dateKey}
                  onPress={() => onDayPress(date)}
                  style={({ pressed }) => pressed && styles.dayCirclePressed}
                >
                  {dayContent}
                </Pressable>
              );
            }

            return <View key={dateKey}>{dayContent}</View>;
          })}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: textSecondaryColor + '20' }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
          <ThemedText style={[styles.progressText, { color: textSecondaryColor }]}>
            {weekProgress.current}/{weekProgress.goal} this week
          </ThemedText>
        </View>
      </View>

      {/* Status Message */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getProgressColor() },
          ]}
        />
        <ThemedText
          style={[
            styles.statusText,
            { color: status.isAtRisk ? warningColor : textSecondaryColor },
          ]}
        >
          {getStatusMessage()}
        </ThemedText>
      </View>

      {/* Next Milestone */}
      {nextMilestone && streakData.currentStreak > 0 && (
        <View style={[styles.milestoneRow, { borderTopColor: textSecondaryColor + '15' }]}>
          <MaterialCommunityIcons
            name="flag-checkered"
            size={14}
            color={textSecondaryColor}
          />
          <ThemedText style={[styles.milestoneText, { color: textSecondaryColor }]}>
            {nextMilestone.weeksAway} week{nextMilestone.weeksAway > 1 ? 's' : ''} to {nextMilestone.milestone}-week milestone
          </ThemedText>
        </View>
      )}

      {/* Recovery Challenge Badge */}
      {status.hasRecoveryChallenge && status.recoveryProgress && (
        <View style={[styles.recoveryBadge, { backgroundColor: warningColor + '15' }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={16} color={warningColor} />
          <ThemedText style={[styles.recoveryText, { color: warningColor }]}>
            Comeback Challenge Active
          </ThemedText>
          <View style={[styles.recoveryProgress, { backgroundColor: warningColor + '30' }]}>
            <ThemedText style={[styles.recoveryProgressText, { color: warningColor }]}>
              {status.recoveryProgress.current}/{status.recoveryProgress.target}
            </ThemedText>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  streakCount: {
    color: 'white',
    fontSize: Typography.lg,
    fontWeight: Typography.weights.bold,
  },
  streakLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  shieldsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  shieldIcon: {
    padding: 2,
  },
  weekProgressSection: {
    marginBottom: Spacing.md,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCirclePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
  dayText: {
    fontSize: Typography.xs,
  },
  progressBarContainer: {
    gap: Spacing.xs,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  milestoneText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
  },
  recoveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  recoveryText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
    flex: 1,
  },
  recoveryProgress: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  recoveryProgressText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.bold,
  },
});
