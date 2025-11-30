import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Platform, Pressable, Dimensions } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AchievementBadge } from '@/components/AchievementBadge';
import { Achievement, UserAchievements } from '@/types';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { getAchievements, checkAchievements } from '@/services/achievements';
import { getBirthRecords, getUserPreferences } from '@/services/storage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';

export default function AchievementsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadAchievements = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // First, ensure achievements are up to date by checking them
      const records = await getBirthRecords();
      const preferences = await getUserPreferences();
      await checkAchievements(records, preferences || { tutorialCompleted: true });
      
      // Then load the updated achievements
      const achievements = await getAchievements();
      setUserAchievements(achievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      // Set default empty achievements if loading fails
      setUserAchievements({
        unlocked: [],
        progress: {},
        stats: {
          totalDeliveries: 0,
          currentStreak: 0,
          longestStreak: 0,
          deliveryTypes: { vaginal: 0, cSection: 0 },
          multipleBirths: 0,
          angelBabies: 0
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAchievements();
      return () => {}; // Optional cleanup function
    }, [loadAchievements])
  );

  const filteredAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  const unlockedCount = userAchievements?.unlocked.length || 0;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'milestone', label: 'Milestones', icon: 'flag' },
    { id: 'special', label: 'Special', icon: 'star' },
    { id: 'skill', label: 'Skills', icon: 'school' },
  ];

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
          {/* Header Section with Gradient */}
          <LinearGradient
            colors={[primaryColor, primaryColor + '95']}
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
                <ThemedText style={[styles.headerSubtitle, { color: 'white' }]}>
                  Your Collection
                </ThemedText>
                <ThemedText style={[styles.headerTitle, { color: 'white' }]}>
                  Achievements
                </ThemedText>
              </View>
              <View style={[styles.headerStatsContainer, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <ThemedText style={[styles.headerStatsValue, { color: 'white' }]}>
                  {completionPercentage}%
                </ThemedText>
                <ThemedText style={[styles.headerStatsLabel, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                  Complete
                </ThemedText>
              </View>
            </View>
          </LinearGradient>

          {/* Key Metrics Cards */}
          <View style={styles.metricsContainer}>
            <View style={[styles.metricCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.metricIconContainer, { backgroundColor: successColor + '20' }]}>
                <Ionicons name="trophy-outline" size={24} color={successColor} />
              </View>
              <View style={styles.metricContent}>
                <ThemedText style={[styles.metricValue, { color: textColor }]}>
                  {unlockedCount}
                </ThemedText>
                <ThemedText style={[styles.metricLabel, { color: textSecondaryColor }]}>
                  Unlocked
                </ThemedText>
              </View>
            </View>

            <View style={[styles.metricCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.metricIconContainer, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="ribbon-outline" size={24} color={primaryColor} />
              </View>
              <View style={styles.metricContent}>
                <ThemedText style={[styles.metricValue, { color: textColor }]}>
                  {totalCount - unlockedCount}
                </ThemedText>
                <ThemedText style={[styles.metricLabel, { color: textSecondaryColor }]}>
                  Remaining
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Categories
              </ThemedText>
              <View style={[styles.totalBadge, { backgroundColor: primaryColor + '15' }]}>
                <ThemedText style={[styles.totalBadgeText, { color: primaryColor }]}>
                  {filteredAchievements.length} achievements
                </ThemedText>
              </View>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id as any)}
                  style={[
                    styles.categoryChip,
                    { 
                      backgroundColor: selectedCategory === category.id 
                        ? primaryColor 
                        : surfaceColor,
                      borderColor: selectedCategory === category.id 
                        ? primaryColor 
                        : 'transparent',
                    }
                  ]}
                >
                  <Ionicons 
                    name={category.icon as any} 
                    size={18} 
                    color={selectedCategory === category.id ? 'white' : textSecondaryColor} 
                  />
                  <ThemedText 
                    style={[
                      styles.categoryChipText,
                      { 
                        color: selectedCategory === category.id ? 'white' : textColor,
                        fontWeight: selectedCategory === category.id ? '600' : '500',
                      }
                    ]}
                  >
                    {category.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Achievements Grid */}
          <View style={styles.achievementsSection}>
            <View style={styles.achievementsGrid}>
              {filteredAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <View style={[styles.achievementCard, { backgroundColor: surfaceColor }]}>
                    <AchievementBadge
                      achievement={achievement}
                      userAchievements={userAchievements || {
                        unlocked: [],
                        progress: {},
                        stats: {
                          totalDeliveries: 0,
                          currentStreak: 0,
                          longestStreak: 0,
                          deliveryTypes: { vaginal: 0, cSection: 0 },
                          multipleBirths: 0,
                          angelBabies: 0
                        }
                      }}
                      size="large"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Empty State */}
          {filteredAchievements.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
              <View style={[styles.emptyIconContainer, { backgroundColor: primaryColor + '10' }]}>
                <Ionicons name="trophy-outline" size={64} color={primaryColor} />
              </View>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                No Achievements Found
              </ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: textSecondaryColor }]}>
                Try selecting a different category to see more achievements.
              </ThemedText>
            </View>
          )}

          {/* Bottom spacing for safe area */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isSmallScreen = screenWidth < 375;

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
    paddingBottom: Spacing.xl + Spacing.sm,
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
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.wide,
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  headerStatsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    minWidth: 80,
  },
  headerStatsValue: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
  },
  headerStatsLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    minHeight: 72,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.xl * 1.2,
  },
  metricLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
    marginTop: 2,
    lineHeight: Typography.xs * 1.2,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
  },
  totalBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  totalBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.xs,
    ...Platform.select({
      ios: {
        ...Shadows.sm,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryChipText: {
    fontSize: Typography.sm,
  },
  achievementsSection: {
    paddingHorizontal: Spacing.lg,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  achievementItem: {
    width: isTablet ? '33.333%' : '50%',
    padding: Spacing.xs,
    aspectRatio: isTablet ? 1.3 : isSmallScreen ? 0.55 : 0.7,
  },
  achievementCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    height: '100%',
    ...Platform.select({
      ios: {
        ...Shadows.sm,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.base,
    maxWidth: 280,
  },
});