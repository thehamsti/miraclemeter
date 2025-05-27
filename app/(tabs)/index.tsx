import React, { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getBirthRecords } from "@/services/storage";
import { BirthRecord } from "@/types";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StatCard } from "@/components/StatCard";
import { RecordCard } from "@/components/RecordCard";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Platform } from "react-native";

export default function HomeScreen() {
  const [recentRecords, setRecentRecords] = useState<BirthRecord[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [boysCount, setBoysCount] = useState(0);
  const [girlsCount, setGirlsCount] = useState(0);
  const [angelsCount, setAngelsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const maleColor = useThemeColor({}, "male");
  const femaleColor = useThemeColor({}, "female");
  const warningColor = useThemeColor({}, "warning");
  const successColor = useThemeColor({}, "success");
  const borderColor = useThemeColor({}, "border");
  const shadowColor = useThemeColor({}, "shadowColor");
  const shadowOpacity = useThemeColor({}, "shadowOpacity");

  const loadStats = useCallback(async () => {
    try {
      const records = await getBirthRecords();

      // Get recent records (last 5)
      const recent = records.slice(-5).reverse();
      setRecentRecords(recent);

      // Calculate today's count
      const today = new Date();
      const todayRecords = records.filter((record) => {
        if (!record.timestamp) return false;
        const recordDate = new Date(record.timestamp);
        return recordDate.toDateString() === today.toDateString();
      });
      setTodayCount(todayRecords.length);

      // Calculate this week's count
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekRecords = records.filter((record) => {
        if (!record.timestamp) return false;
        const recordDate = new Date(record.timestamp);
        return recordDate >= weekAgo;
      });
      setWeekCount(weekRecords.length);

      // Calculate this month's count
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthRecords = records.filter((record) => {
        if (!record.timestamp) return false;
        const recordDate = new Date(record.timestamp);
        return recordDate >= monthAgo;
      });
      setMonthCount(monthRecords.length);

      // Calculate gender counts
      let boys = 0, girls = 0, angels = 0;
      records.forEach((record) => {
        record.babies.forEach((baby) => {
          if (baby.gender === "boy") boys++;
          if (baby.gender === "girl") girls++;
          if (baby.gender === "angel") angels++;
        });
      });
      setBoysCount(boys);
      setGirlsCount(girls);
      setAngelsCount(angels);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getEmoji = () => {
    const emojis = ["👶", "🍼", "🎉", "💝", "✨", "🌟"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

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
            <Link href="/settings" asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.settingsButton,
                  pressed && styles.settingsButtonPressed,
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="settings-outline" size={24} color="white" />
              </Pressable>
            </Link>
          </View>
        </LinearGradient>

        {/* Quick Stats Overview */}
        <View style={styles.quickStatsContainer}>
          <View
            style={[styles.quickStatCard, { backgroundColor: surfaceColor }]}
          >
            <View
              style={[styles.quickStatIconContainer, {
                backgroundColor: successColor + "20",
              }]}
            >
              <Ionicons name="today-outline" size={20} color={successColor} />
            </View>
            <View style={styles.quickStatTextContainer}>
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
          </View>

          <View
            style={[styles.quickStatCard, { backgroundColor: surfaceColor }]}
          >
            <View
              style={[styles.quickStatIconContainer, {
                backgroundColor: primaryColor + "20",
              }]}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={primaryColor}
              />
            </View>
            <View style={styles.quickStatTextContainer}>
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
          </View>

          <View
            style={[styles.quickStatCard, { backgroundColor: surfaceColor }]}
          >
            <View
              style={[styles.quickStatIconContainer, {
                backgroundColor: warningColor + "20",
              }]}
            >
              <Ionicons
                name="trending-up-outline"
                size={20}
                color={warningColor}
              />
            </View>
            <View style={styles.quickStatTextContainer}>
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
        </View>

        {/* Main CTA Button */}
        <View style={styles.ctaContainer}>
          <Link href="/quick-entry" asChild>
            <Pressable
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
        </View>

        {/* Gender Distribution */}
        <View style={styles.genderSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Gender Distribution
            </ThemedText>
            <Link href="/stats" asChild>
              <Pressable style={styles.seeAllButton}>
                <ThemedText
                  style={[styles.seeAllText, { color: primaryColor }]}
                >
                  See Details
                </ThemedText>
                <Ionicons name="arrow-forward" size={16} color={primaryColor} />
              </Pressable>
            </Link>
          </View>

          <View style={styles.genderCards}>
            <View
              style={[styles.genderCard, {
                backgroundColor: maleColor + "10",
                borderColor: maleColor + "30",
              }]}
            >
              <Ionicons name="male" size={28} color={maleColor} />
              <ThemedText
                style={[styles.genderCount, { color: textColor }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {boysCount}
              </ThemedText>
              <ThemedText
                style={[styles.genderLabel, { color: textSecondaryColor }]}
                numberOfLines={1}
              >
                Boys
              </ThemedText>
            </View>

            <View
              style={[styles.genderCard, {
                backgroundColor: femaleColor + "10",
                borderColor: femaleColor + "30",
              }]}
            >
              <Ionicons name="female" size={28} color={femaleColor} />
              <ThemedText
                style={[styles.genderCount, { color: textColor }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {girlsCount}
              </ThemedText>
              <ThemedText
                style={[styles.genderLabel, { color: textSecondaryColor }]}
                numberOfLines={1}
              >
                Girls
              </ThemedText>
            </View>

            {angelsCount > 0 && (
              <View
                style={[styles.genderCard, {
                  backgroundColor: warningColor + "10",
                  borderColor: warningColor + "30",
                }]}
              >
                <Ionicons name="star" size={28} color={warningColor} />
                <ThemedText
                  style={[styles.genderCount, { color: textColor }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {angelsCount}
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

          {recentRecords.length > 0
            ? (
              <View style={styles.recentList}>
                {recentRecords.map((record, index) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    style={[
                      styles.recordCard,
                      { backgroundColor: surfaceColor },
                      index === 0 && styles.firstRecord,
                    ]}
                  />
                ))}
              </View>
            )
            : (
              <View
                style={[styles.emptyState, { backgroundColor: surfaceColor }]}
              >
                <View
                  style={[styles.emptyIconContainer, {
                    backgroundColor: primaryColor + "10",
                  }]}
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  quickStatsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    gap: Spacing.sm,
  },
  quickStatCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  quickStatTextContainer: {
    flex: 1,
  },
  quickStatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  quickStatValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
  },
  quickStatLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
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
});

