import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Dimensions,
  Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useStreaks } from '@/hooks/useStreaks';
import { ThemedText } from '@/components/ThemedText';
import { StreakShareCard } from '@/components/StreakShareCard';
import { DayDetailModal } from '@/components/DayDetailModal';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';
import { getBirthRecords } from '@/services/storage';
import { captureAndShareStats } from '@/services/shareCard';
import type { BirthRecord } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_CELL_SIZE = Math.floor((SCREEN_WIDTH - Spacing.lg * 2 - Spacing.xs * 6) / 7);

// Get dates that had records logged
function getLoggedDates(records: BirthRecord[]): Set<string> {
  const dates = new Set<string>();
  for (const record of records) {
    if (record.timestamp) {
      const date = new Date(record.timestamp);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dates.add(dateStr);
    }
  }
  return dates;
}

// Get all dates in a month
function getMonthDates(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start
  
  const dates: (Date | null)[] = [];
  
  // Add padding for days before the 1st
  for (let i = 0; i < startPadding; i++) {
    dates.push(null);
  }
  
  // Add all days in the month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    dates.push(new Date(year, month, day));
  }
  
  return dates;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function StreaksScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');

  const { streakData, status, weekProgress, nextMilestone, refresh } = useStreaks();
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const [allRecords, setAllRecords] = useState<BirthRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const shareCardRef = useRef<View>(null!);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      await refresh();
      const records = await getBirthRecords();
      setAllRecords(records);
      setLoggedDates(getLoggedDates(records));
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  // Get records for a specific date
  const getRecordsForDate = useCallback((date: Date): BirthRecord[] => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return allRecords.filter((record) => {
      if (!record.timestamp) return false;
      const recordDate = new Date(record.timestamp);
      const recordDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
      return recordDateStr === dateStr;
    });
  }, [allRecords]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    setTimeout(async () => {
      try {
        await captureAndShareStats(shareCardRef, 'lifetime');
      } catch (error) {
        console.error('Error sharing streak:', error);
      } finally {
        setIsSharing(false);
        setShowShareModal(false);
      }
    }, 100);
  }, []);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const monthDates = getMonthDates(currentMonth.getFullYear(), currentMonth.getMonth());
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calculate stats
  const totalLoggedDays = loggedDates.size;
  const thisMonthLogs = Array.from(loggedDates).filter((d) => {
    const [year, month] = d.split('-').map(Number);
    return year === currentMonth.getFullYear() && month === currentMonth.getMonth() + 1;
  }).length;

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, styles.loadingContainer, { backgroundColor }]}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
          {/* Header */}
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </Pressable>
              <View style={styles.headerTextContainer}>
                <ThemedText style={styles.headerSubtitle}>Your Progress</ThemedText>
                <ThemedText style={styles.headerTitle}>Streak Tracker</ThemedText>
              </View>
              <Pressable
                onPress={() => setShowShareModal(true)}
                style={styles.shareButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="share-outline" size={22} color="white" />
              </Pressable>
            </View>

            {/* Main Streak Display */}
            <View style={styles.mainStreakContainer}>
              <View style={styles.streakCircle}>
                <MaterialCommunityIcons name="fire" size={32} color="#FF6B35" />
                <ThemedText style={styles.streakNumber}>
                  {streakData.currentStreak}
                </ThemedText>
                <ThemedText style={styles.streakUnit}>
                  {streakData.currentStreak === 1 ? 'week' : 'weeks'}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FF6B35' + '20' }]}>
                <MaterialCommunityIcons name="trophy" size={22} color="#FF6B35" />
              </View>
              <View style={styles.statContent}>
                <ThemedText style={[styles.statValue, { color: textColor }]}>
                  {streakData.longestStreak}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                  Best Streak
                </ThemedText>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                <MaterialCommunityIcons name="shield" size={22} color="#3B82F6" />
              </View>
              <View style={styles.statContent}>
                <ThemedText style={[styles.statValue, { color: textColor }]}>
                  {streakData.streakShields}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                  Shields
                </ThemedText>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.statIconContainer, { backgroundColor: successColor + '20' }]}>
                <MaterialCommunityIcons name="calendar-check" size={22} color={successColor} />
              </View>
              <View style={styles.statContent}>
                <ThemedText style={[styles.statValue, { color: textColor }]}>
                  {totalLoggedDays}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                  Days Logged
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Weekly Progress */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                This Week
              </ThemedText>
              <View
                style={[
                  styles.weeklyBadge,
                  {
                    backgroundColor: status.isGoalMet ? successColor + '20' : primaryColor + '15',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.weeklyBadgeText,
                    { color: status.isGoalMet ? successColor : primaryColor },
                  ]}
                >
                  {weekProgress.current}/{weekProgress.goal} goal
                </ThemedText>
              </View>
            </View>

            {/* Week progress bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: textSecondaryColor + '20' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${weekProgress.percentage}%`,
                      backgroundColor: status.isGoalMet ? successColor : primaryColor,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Status message */}
            <View style={styles.statusRow}>
              <MaterialCommunityIcons
                name={status.isGoalMet ? 'check-circle' : status.isAtRisk ? 'alert-circle' : 'clock-outline'}
                size={18}
                color={status.isGoalMet ? successColor : status.isAtRisk ? warningColor : textSecondaryColor}
              />
              <ThemedText style={[styles.statusText, { color: textSecondaryColor }]}>
                {status.isGoalMet
                  ? 'Weekly goal complete! Extra logs earn shields.'
                  : status.isAtRisk
                  ? `${status.logsRemaining} more log${status.logsRemaining > 1 ? 's' : ''} needed - streak at risk!`
                  : `${status.logsRemaining} log${status.logsRemaining > 1 ? 's' : ''} to hit your goal`}
              </ThemedText>
            </View>

            {/* Next milestone */}
            {nextMilestone && streakData.currentStreak > 0 && (
              <View style={[styles.milestoneRow, { borderTopColor: textSecondaryColor + '15' }]}>
                <MaterialCommunityIcons name="flag-checkered" size={16} color={primaryColor} />
                <ThemedText style={[styles.milestoneText, { color: textSecondaryColor }]}>
                  {nextMilestone.weeksAway} week{nextMilestone.weeksAway > 1 ? 's' : ''} to{' '}
                  {nextMilestone.milestone}-week milestone
                </ThemedText>
              </View>
            )}
          </View>

          {/* Recovery Challenge */}
          {status.hasRecoveryChallenge && status.recoveryProgress && (
            <View style={[styles.section, styles.recoverySection, { backgroundColor: warningColor + '15' }]}>
              <View style={styles.recoveryHeader}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color={warningColor} />
                <ThemedText style={[styles.recoveryTitle, { color: warningColor }]}>
                  Comeback Challenge
                </ThemedText>
              </View>
              <ThemedText style={[styles.recoveryDesc, { color: textSecondaryColor }]}>
                Log {status.recoveryProgress.target} times to restore your streak
              </ThemedText>
              <View style={styles.recoveryProgressContainer}>
                <View style={[styles.recoveryProgressBg, { backgroundColor: warningColor + '30' }]}>
                  <View
                    style={[
                      styles.recoveryProgressFill,
                      {
                        width: `${(status.recoveryProgress.current / status.recoveryProgress.target) * 100}%`,
                        backgroundColor: warningColor,
                      },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.recoveryProgressText, { color: warningColor }]}>
                  {status.recoveryProgress.current}/{status.recoveryProgress.target}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Calendar */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.calendarHeader}>
              <Pressable
                onPress={() => navigateMonth('prev')}
                style={styles.calendarNavButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={20} color={textSecondaryColor} />
              </Pressable>
              <ThemedText style={[styles.calendarTitle, { color: textColor }]}>
                {formatMonthYear(currentMonth)}
              </ThemedText>
              <Pressable
                onPress={() => navigateMonth('next')}
                style={styles.calendarNavButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
              </Pressable>
            </View>

            {/* Day labels */}
            <View style={styles.dayLabelsRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <View key={i} style={styles.dayLabelCell}>
                  <ThemedText style={[styles.dayLabel, { color: textSecondaryColor }]}>
                    {day}
                  </ThemedText>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {monthDates.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.calendarCell} />;
                }

                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const isLogged = loggedDates.has(dateStr);
                const isToday = dateStr === todayStr;
                const isFuture = date > today;

                return (
                  <Pressable
                    key={dateStr}
                    onPress={() => setSelectedDate(date)}
                    style={({ pressed }) => [
                      styles.calendarCell,
                      isToday && styles.calendarCellToday,
                      isToday && { borderColor: primaryColor },
                      pressed && styles.calendarCellPressed,
                    ]}
                  >
                    {isLogged ? (
                      <View style={[styles.loggedDot, { backgroundColor: '#FF6B35' }]}>
                        <MaterialCommunityIcons name="fire" size={14} color="white" />
                      </View>
                    ) : (
                      <ThemedText
                        style={[
                          styles.calendarDate,
                          { color: isFuture ? textSecondaryColor + '50' : textSecondaryColor },
                          isToday && { color: primaryColor, fontWeight: '700' },
                        ]}
                      >
                        {date.getDate()}
                      </ThemedText>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Month stats */}
            <View style={[styles.monthStats, { borderTopColor: textSecondaryColor + '15' }]}>
              <ThemedText style={[styles.monthStatsText, { color: textSecondaryColor }]}>
                {thisMonthLogs} day{thisMonthLogs !== 1 ? 's' : ''} logged this month
              </ThemedText>
            </View>
          </View>

          {/* Shields Section - Redesigned */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Streak Shields
              </ThemedText>
              <View style={styles.shieldIcons}>
                {[0, 1, 2].map((i) => (
                  <MaterialCommunityIcons
                    key={i}
                    name="shield"
                    size={20}
                    color={i < streakData.streakShields ? '#3B82F6' : textSecondaryColor + '40'}
                  />
                ))}
              </View>
            </View>
            
            {/* What shields do */}
            <View style={[styles.shieldInfoCard, { backgroundColor: '#3B82F6' + '10' }]}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#3B82F6" />
              <View style={styles.shieldInfoText}>
                <ThemedText style={[styles.shieldInfoTitle, { color: textColor }]}>
                  Protection for busy weeks
                </ThemedText>
                <ThemedText style={[styles.shieldInfoDesc, { color: textSecondaryColor }]}>
                  If you miss your weekly goal, a shield is automatically used to protect your streak.
                </ThemedText>
              </View>
            </View>

            {/* How to earn shields */}
            <ThemedText style={[styles.earnShieldsTitle, { color: textColor }]}>
              How to earn shields
            </ThemedText>
            
            <View style={styles.earnMethodsContainer}>
              {/* Method 1: Exceed goal */}
              <View style={[styles.earnMethodCard, { backgroundColor: backgroundColor }]}>
                <View style={[styles.earnMethodIcon, { backgroundColor: successColor + '20' }]}>
                  <MaterialCommunityIcons name="plus-circle" size={20} color={successColor} />
                </View>
                <View style={styles.earnMethodContent}>
                  <ThemedText style={[styles.earnMethodTitle, { color: textColor }]}>
                    Exceed your goal
                  </ThemedText>
                  <ThemedText style={[styles.earnMethodDesc, { color: textSecondaryColor }]}>
                    Log {weekProgress.goal + 1}+ times in a week
                  </ThemedText>
                </View>
                {weekProgress.current > weekProgress.goal ? (
                  <View style={[styles.earnedBadge, { backgroundColor: successColor + '20' }]}>
                    <Ionicons name="checkmark" size={14} color={successColor} />
                  </View>
                ) : weekProgress.current === weekProgress.goal ? (
                  <ThemedText style={[styles.earnProgress, { color: successColor }]}>
                    +1 more!
                  </ThemedText>
                ) : (
                  <ThemedText style={[styles.earnProgress, { color: textSecondaryColor }]}>
                    {weekProgress.goal + 1 - weekProgress.current} to go
                  </ThemedText>
                )}
              </View>

              {/* Method 2: Hit milestones */}
              <View style={[styles.earnMethodCard, { backgroundColor: backgroundColor }]}>
                <View style={[styles.earnMethodIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                  <MaterialCommunityIcons name="flag-checkered" size={20} color="#F59E0B" />
                </View>
                <View style={styles.earnMethodContent}>
                  <ThemedText style={[styles.earnMethodTitle, { color: textColor }]}>
                    Hit milestones
                  </ThemedText>
                  <ThemedText style={[styles.earnMethodDesc, { color: textSecondaryColor }]}>
                    {nextMilestone 
                      ? `Next: ${nextMilestone.milestone} weeks (${nextMilestone.weeksAway} away)`
                      : 'All milestones reached!'
                    }
                  </ThemedText>
                </View>
                <MaterialCommunityIcons name="trophy" size={18} color="#F59E0B" />
              </View>
            </View>

            {/* Shield status */}
            {streakData.streakShields >= 3 ? (
              <View style={[styles.shieldStatusBar, { backgroundColor: '#3B82F6' + '15' }]}>
                <MaterialCommunityIcons name="shield-star" size={16} color="#3B82F6" />
                <ThemedText style={[styles.shieldStatusText, { color: '#3B82F6' }]}>
                  Max shields! You're fully protected.
                </ThemedText>
              </View>
            ) : streakData.streakShields === 0 ? (
              <View style={[styles.shieldStatusBar, { backgroundColor: warningColor + '15' }]}>
                <MaterialCommunityIcons name="shield-alert" size={16} color={warningColor} />
                <ThemedText style={[styles.shieldStatusText, { color: warningColor }]}>
                  No shields - missing a week will break your streak!
                </ThemedText>
              </View>
            ) : null}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Share Modal */}
        <Modal
          visible={showShareModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowShareModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => !isSharing && setShowShareModal(false)}
            />
            <View style={styles.modalContent}>
              <StreakShareCard
                ref={shareCardRef}
                streakWeeks={streakData.currentStreak}
                shieldCount={streakData.streakShields}
              />
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalShareButton, { backgroundColor: '#FF6B35' }]}
                  onPress={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="share-outline" size={20} color="white" />
                      <ThemedText style={styles.modalShareButtonText}>Share</ThemedText>
                    </>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.modalCancelButton, { backgroundColor: surfaceColor }]}
                  onPress={() => setShowShareModal(false)}
                  disabled={isSharing}
                >
                  <ThemedText style={[styles.modalCancelButtonText, { color: textColor }]}>
                    Cancel
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Day Detail Modal */}
        <DayDetailModal
          visible={selectedDate !== null}
          date={selectedDate}
          records={selectedDate ? getRecordsForDate(selectedDate) : []}
          onClose={() => setSelectedDate(null)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.xl + 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
    color: 'white',
    letterSpacing: Typography.letterSpacing.tight,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainStreakContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  streakCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    ...Shadows.lg,
  },
  streakNumber: {
    fontSize: 44,
    fontWeight: Typography.weights.bold,
    color: '#FF6B35',
    lineHeight: 48,
    includeFontPadding: false,
  },
  streakUnit: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    color: '#FF6B35',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl - 10,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
  },
  statLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
  },
  weeklyBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  weeklyBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.semibold,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  recoverySection: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  recoveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recoveryTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.bold,
  },
  recoveryDesc: {
    fontSize: Typography.sm,
    marginBottom: Spacing.md,
  },
  recoveryProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  recoveryProgressBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  recoveryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  recoveryProgressText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.bold,
    minWidth: 40,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  calendarNavButton: {
    padding: Spacing.xs,
  },
  calendarTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayLabelCell: {
    width: CALENDAR_CELL_SIZE,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: CALENDAR_CELL_SIZE,
    height: CALENDAR_CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CALENDAR_CELL_SIZE / 2,
  },
  calendarCellToday: {
    borderWidth: 2,
  },
  calendarCellPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  calendarDate: {
    fontSize: Typography.sm,
  },
  loggedDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthStats: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  monthStatsText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  shieldIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  shieldDesc: {
    fontSize: Typography.sm,
    lineHeight: Typography.lineHeights.base,
  },
  shieldInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  shieldInfoText: {
    flex: 1,
  },
  shieldInfoTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: 4,
  },
  shieldInfoDesc: {
    fontSize: Typography.sm,
    lineHeight: Typography.lineHeights.sm,
  },
  earnShieldsTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earnMethodsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  earnMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  earnMethodIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnMethodContent: {
    flex: 1,
  },
  earnMethodTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
  },
  earnMethodDesc: {
    fontSize: Typography.xs,
    marginTop: 2,
  },
  earnedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnProgress: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.semibold,
  },
  shieldStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  shieldStatusText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    minWidth: 120,
  },
  modalShareButtonText: {
    color: 'white',
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  modalCancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  modalCancelButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
  },
});
