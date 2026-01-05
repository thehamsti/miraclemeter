import React, { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { BorderRadius, Shadows, Spacing, Typography } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { RecordCard } from "@/components/RecordCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useStatistics } from "@/hooks/useStatistics";
import { getAchievements } from "@/services/achievements";
import { getHomeRecapDismissed, setHomeRecapDismissed } from "@/services/storage";
import type { UserAchievements } from "@/types";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [isRecapDismissed, setIsRecapDismissed] = useState(false);
  
  const {
    recentRecords,
    todayCount,
    weekCount,
    monthCount,
    genderCounts,
    yearlyBabyCounts,
    refresh,
  } = useStatistics();

  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const maleColor = useThemeColor({}, "male");
  const femaleColor = useThemeColor({}, "female");
  const warningColor = useThemeColor({}, "warning");
  const successColor = useThemeColor({}, "success");

  const recapYear = new Date().getFullYear() - 1;
  const recapEntry = yearlyBabyCounts.find((entry) => entry.year === recapYear);

  const loadAchievements = useCallback(async (): Promise<void> => {
    try {
      const achievements = await getAchievements();
      setUserAchievements(achievements);
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
  }, []);

  const loadRecapDismissal = useCallback(async (): Promise<void> => {
    try {
      const dismissed = await getHomeRecapDismissed(recapYear);
      setIsRecapDismissed(dismissed);
    } catch (error) {
      console.error("Error loading recap dismissal:", error);
    }
  }, [recapYear]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadAchievements();
      loadRecapDismissal();
    }, [refresh, loadAchievements, loadRecapDismissal]),
  );

  useEffect(() => {
    loadRecapDismissal();
  }, [loadRecapDismissal]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    await loadAchievements();
    await loadRecapDismissal();
    setRefreshing(false);
  }, [refresh, loadAchievements, loadRecapDismissal]);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getEmoji = (): string => {
    const emojis = ["👶", "🍼", "🎉", "💝", "✨", "🌟"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const handleDismissRecap = useCallback(async (): Promise<void> => {
    try {
      setIsRecapDismissed(true);
      await setHomeRecapDismissed(recapYear, true);
    } catch (error) {
      console.error("Error dismissing recap:", error);
    }
  }, [recapYear]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
          />
        }
      >
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={[primaryColor, primaryColor + "95"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <ThemedText
                style={[styles.greeting, { color: "white" }]}
                numberOfLines={1}
              >
                {getGreeting()} {getEmoji()}
              </ThemedText>
              <ThemedText
                style={[styles.headerTitle, { color: "white" }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Your Birth Tracker
              </ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats Overview */}
        <View style={styles.quickStatsContainer}>
          <View
            style={[styles.quickStatCard, { backgroundColor: surfaceColor }]}
          >
            <View
              style={[
                styles.quickStatIconContainer,
                {
                  backgroundColor: successColor + "20",
                },
              ]}
            >
              <Ionicons name="today-outline" size={24} color={successColor} />
            </View>
            <ThemedText
              style={[styles.quickStatValue, { color: textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {todayCount}
            </ThemedText>
            <ThemedText
              style={[styles.quickStatLabel, { color: textSecondaryColor }]}
              numberOfLines={1}
            >
              Today
            </ThemedText>
          </View>

          <View
            style={[styles.quickStatCard, { backgroundColor: surfaceColor }]}
          >
            <View
              style={[
                styles.quickStatIconContainer,
                {
                  backgroundColor: primaryColor + "20",
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color={primaryColor}
              />
            </View>
            <ThemedText
              style={[styles.quickStatValue, { color: textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {weekCount}
            </ThemedText>
            <ThemedText
              style={[styles.quickStatLabel, { color: textSecondaryColor }]}
              numberOfLines={1}
            >
              This Week
            </ThemedText>
          </View>

          <View
            style={[styles.quickStatCard, { backgroundColor: surfaceColor }]}
          >
            <View
              style={[
                styles.quickStatIconContainer,
                {
                  backgroundColor: warningColor + "20",
                },
              ]}
            >
              <Ionicons
                name="trending-up-outline"
                size={24}
                color={warningColor}
              />
            </View>
            <ThemedText
              style={[styles.quickStatValue, { color: textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {monthCount}
            </ThemedText>
            <ThemedText
              style={[styles.quickStatLabel, { color: textSecondaryColor }]}
              numberOfLines={1}
            >
              This Month
            </ThemedText>
          </View>
        </View>

        {recapEntry && recapEntry.babies > 0 && !isRecapDismissed && (
          <View style={styles.recapBannerContainer}>
            <Link href="/recap" asChild>
              <Pressable
                accessibilityLabel={`View your ${recapYear} recap`}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.recapBanner,
                  pressed && styles.recapBannerPressed,
                ]}
              >
                <LinearGradient
                  colors={[primaryColor, primaryColor + "DD"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.recapBannerGradient}
                >
                  <View style={styles.recapBannerContent}>
                    <View style={styles.recapIconContainer}>
                      <Ionicons name="sparkles" size={24} color="white" />
                    </View>
                    <View style={styles.recapTextContainer}>
                      <ThemedText style={styles.recapBannerTitle}>
                        Your {recapYear} Wrap
                      </ThemedText>
                      <ThemedText style={styles.recapBannerSubtitle}>
                        {recapEntry.babies} {recapEntry.babies === 1 ? "baby" : "babies"} welcomed
                      </ThemedText>
                    </View>
                    <View style={styles.recapArrowContainer}>
                      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            </Link>
            <Pressable
              accessibilityLabel="Dismiss recap banner"
              accessibilityRole="button"
              onPress={handleDismissRecap}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.recapDismiss}
            >
              <View style={[styles.recapDismissIcon, { backgroundColor: surfaceColor }]}>
                <Ionicons name="close" size={14} color={textSecondaryColor} />
              </View>
            </Pressable>
          </View>
        )}

        {/* Main CTA Button */}
        <View style={styles.ctaContainer}>
          <Link href="/quick-entry" asChild>
            <Pressable
              accessibilityLabel="Add new birth record"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.ctaButton,
                { backgroundColor: primaryColor },
                pressed && styles.ctaButtonPressed,
              ]}
            >
              <LinearGradient
                colors={[primaryColor, primaryColor + "EE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                <Ionicons name="add-circle" size={24} color="white" />
                <ThemedText
                  style={styles.ctaText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Add Birth Record
                </ThemedText>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </Pressable>
          </Link>
          
          {/* Achievements Button */}
          <Link href="/achievements" asChild>
            <Pressable
              accessibilityLabel="View achievements and progress"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.achievementCtaButton,
                { backgroundColor: surfaceColor },
                pressed && styles.achievementCtaButtonPressed,
              ]}
            >
              <View style={styles.achievementCtaContent}>
                <View style={[styles.achievementIconWrapper, { backgroundColor: primaryColor + "20" }]}>
                  <Ionicons name="trophy" size={24} color={primaryColor} />
                </View>
                <View style={styles.achievementTextWrapper}>
                  <ThemedText
                    style={[styles.achievementCtaTitle, { color: textColor }]}
                    numberOfLines={1}
                  >
                    Achievements
                  </ThemedText>
                  <ThemedText
                    style={[styles.achievementCtaSubtitle, { color: textSecondaryColor }]}
                    numberOfLines={1}
                  >
                    {userAchievements ? `${userAchievements.unlocked.length}/${ACHIEVEMENTS.length} unlocked` : 'View your progress'}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
              </View>
            </Pressable>
          </Link>
        </View>

        {/* Gender Distribution */}
        <View style={styles.genderSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Gender Distribution
            </ThemedText>
<Link href="/stats" asChild>
              <Pressable 
                accessibilityLabel="View detailed statistics"
                accessibilityRole="button"
                style={styles.seeAllButton}
              >
                <ThemedText
                  style={[styles.seeAllText, { color: primaryColor }]}
                >
                  See all
                </ThemedText>
              </Pressable>
            </Link>
          </View>

          <View style={styles.genderCards}>
            <View
              style={[
                styles.genderCard,
                {
                  backgroundColor: maleColor + "10",
                  borderColor: maleColor + "30",
                },
              ]}
            >
              <Ionicons name="male" size={28} color={maleColor} />
              <ThemedText style={[styles.genderCount, { color: textColor }]}>
                {genderCounts.boys}
              </ThemedText>
              <ThemedText
                style={[styles.genderLabel, { color: textSecondaryColor }]}
                numberOfLines={1}
              >
                Boys
              </ThemedText>
            </View>

            <View
              style={[
                styles.genderCard,
                {
                  backgroundColor: femaleColor + "10",
                  borderColor: femaleColor + "30",
                },
              ]}
            >
              <Ionicons name="female" size={28} color={femaleColor} />
              <ThemedText style={[styles.genderCount, { color: textColor }]}>
                {genderCounts.girls}
              </ThemedText>
              <ThemedText
                style={[styles.genderLabel, { color: textSecondaryColor }]}
                numberOfLines={1}
              >
                Girls
              </ThemedText>
            </View>

            {genderCounts.angels > 0 && (
              <View
                style={[
                  styles.genderCard,
                  {
                    backgroundColor: warningColor + "10",
                    borderColor: warningColor + "30",
                  },
                ]}
              >
                <Ionicons name="star" size={28} color={warningColor} />
                <ThemedText style={[styles.genderCount, { color: textColor }]}>
                  {genderCounts.angels}
                </ThemedText>
                <ThemedText
                  style={[styles.genderLabel, { color: textSecondaryColor }]}
                  numberOfLines={1}
                >
                  Angels
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Recent Entries
            </ThemedText>
            <Link href="/history" asChild>
              <Pressable style={styles.seeAllButton}>
                <ThemedText
                  style={[styles.seeAllText, { color: primaryColor }]}
                >
                  View All
                </ThemedText>
                <Ionicons name="arrow-forward" size={16} color={primaryColor} />
              </Pressable>
            </Link>
          </View>

          {recentRecords.length > 0 ? (
            <View style={styles.recentList}>
              {recentRecords.map((record, index) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  style={[
                    styles.recordCard,
                    { backgroundColor: surfaceColor },
                    index === 0 ? styles.firstRecord : undefined,
                  ]}
                />
              ))}
            </View>
          ) : (
            <View
              style={[styles.emptyState, { backgroundColor: surfaceColor }]}
            >
              <View
                style={[
                  styles.emptyIconContainer,
                  {
                    backgroundColor: primaryColor + "10",
                  },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={primaryColor}
                />
              </View>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                No Records Yet
              </ThemedText>
              <ThemedText
                style={[styles.emptyText, { color: textSecondaryColor }]}
              >
                Start tracking births by tapping the button above
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: Spacing.xl + Spacing.sm,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  greeting: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.wide,
  },
  headerTitle: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  quickStatsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    gap: Spacing.sm,
  },
  quickStatCard: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.xs,
    minHeight: 100,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quickStatTextContainer: {
    flex: 1,
  },
  quickStatIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  quickStatValue: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.xs,
  },
  quickStatLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    textAlign: "center",
  },
  recapBannerContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    position: "relative",
  },
  recapBanner: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  recapBannerPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  recapBannerGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  recapBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  recapIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  recapTextContainer: {
    flex: 1,
  },
  recapBannerTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.bold,
    color: "white",
    marginBottom: 2,
  },
  recapBannerSubtitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    color: "rgba(255, 255, 255, 0.85)",
  },
  recapArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  recapDismiss: {
    position: "absolute",
    top: -8,
    right: Spacing.lg - 4,
    zIndex: 1,
  },
  recapDismissIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        ...Shadows.sm,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  ctaButton: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        ...Shadows.lg,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  ctaButtonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.97 }],
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  ctaText: {
    color: "white",
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
  },
  genderSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  seeAllText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  genderCards: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  genderCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    minHeight: 100,
  },
  genderCount: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.sm,
  },
  genderLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  recentSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  recentList: {
    gap: Spacing.sm,
  },
  recordCard: {
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  firstRecord: {
    ...Shadows.md,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Platform.select({
      ios: {
        ...Shadows.sm,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.sm,
    textAlign: "center",
    lineHeight: Typography.lineHeights.sm,
  },
  achievementCtaButton: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        ...Shadows.sm,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  achievementCtaButtonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  achievementCtaContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  achievementIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementTextWrapper: {
    flex: 1,
  },
  achievementCtaTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs / 2,
  },
  achievementCtaSubtitle: {
    fontSize: Typography.sm,
  },
});
