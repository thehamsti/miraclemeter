import React, { useCallback, useEffect, useState, useRef } from "react";
import { Animated } from "react-native";
import { Platform, Pressable, RefreshControl, StyleSheet, View, Modal, Alert } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { BlurView } from "expo-blur";
import { Link, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BorderRadius, Shadows, Spacing, Typography } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { RecordCard } from "@/components/RecordCard";
import { StatsShareCard, StatsPeriod } from "@/components/StatsShareCard";
import { StreakProgressCard } from "@/components/StreakProgressCard";
import { StreakMilestoneModal } from "@/components/StreakMilestoneModal";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useStatistics } from "@/hooks/useStatistics";
import { useStreaks } from "@/hooks/useStreaks";

import { getHomeRecapDismissed, setHomeRecapDismissed, getBirthRecords } from "@/services/storage";
import { captureAndShareStats } from "@/services/shareCard";
import { useMenu } from "./_layout";
import type { BirthRecord } from "@/types";

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

const HEADER_HEIGHT = 56;
const SCROLL_THRESHOLD = 100;

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isRecapDismissed, setIsRecapDismissed] = useState(false);
  const [showSharePicker, setShowSharePicker] = useState(false);
  const [selectedStatsPeriod, setSelectedStatsPeriod] = useState<StatsPeriod | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null);
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const statsShareCardRef = useRef<View>(null!);
  
  // Animated values for smooth header transition
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerAnimatedValue = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isHeaderHidden = useRef(false);
  
  const insets = useSafeAreaInsets();
  
  const {
    recentRecords,
    weekCount,
    monthCount,
    yearCount,
    totalDeliveries,
    genderCounts,
    yearlyBabyCounts,
    refresh,
  } = useStatistics();

  const { streakData, isAtRisk, status, weekProgress, nextMilestone, refresh: refreshStreak } = useStreaks();
  const { openMenu } = useMenu();
  const router = useRouter();

  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const maleColor = useThemeColor({}, "male");
  const femaleColor = useThemeColor({}, "female");
  const warningColor = useThemeColor({}, "warning");

  const recapYear = new Date().getFullYear() - 1;
  const recapEntry = yearlyBabyCounts.find((entry) => entry.year === recapYear);

  const loadRecapDismissal = useCallback(async (): Promise<void> => {
    try {
      const dismissed = await getHomeRecapDismissed(recapYear);
      setIsRecapDismissed(dismissed);
    } catch (error) {
      console.error("Error loading recap dismissal:", error);
    }
  }, [recapYear]);

  const loadLoggedDates = useCallback(async () => {
    try {
      const records = await getBirthRecords();
      setLoggedDates(getLoggedDates(records));
    } catch (error) {
      console.error("Error loading logged dates:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadRecapDismissal();
      refreshStreak();
      loadLoggedDates();
    }, [refresh, loadRecapDismissal, refreshStreak, loadLoggedDates]),
  );

  useEffect(() => {
    loadRecapDismissal();
  }, [loadRecapDismissal]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Reset header to visible on refresh
    isHeaderHidden.current = false;
    Animated.spring(headerAnimatedValue, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
    await refresh();
    await loadRecapDismissal();
    await refreshStreak();
    await loadLoggedDates();
    setRefreshing(false);
  }, [refresh, loadRecapDismissal, refreshStreak, loadLoggedDates, headerAnimatedValue]);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getEmoji = (): string => {
    const emojis = ["🎀", "✨", "💕", "🌸", "👶", "💝"];
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

  const getStatsCount = useCallback((period: StatsPeriod): number => {
    switch (period) {
      case 'week': return weekCount;
      case 'month': return monthCount;
      case 'year': return yearCount;
      case 'lifetime': return totalDeliveries;
    }
  }, [weekCount, monthCount, yearCount, totalDeliveries]);

  const handleShareStats = useCallback(async () => {
    if (!selectedStatsPeriod) return;
    
    setIsSharing(true);
    
    setTimeout(async () => {
      try {
        await captureAndShareStats(statsShareCardRef, selectedStatsPeriod);
      } catch (error) {
        console.error('Error sharing stats:', error);
        Alert.alert('Sharing Failed', 'Unable to share stats. Please try again.');
      } finally {
        setIsSharing(false);
        setSelectedStatsPeriod(null);
      }
    }, 100);
  }, [selectedStatsPeriod]);

  // Handle scroll with smooth spring animations
  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const shouldHide = currentY > SCROLL_THRESHOLD;
    
    if (shouldHide !== isHeaderHidden.current) {
      isHeaderHidden.current = shouldHide;
      Animated.spring(headerAnimatedValue, {
        toValue: shouldHide ? 1 : 0,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start();
    }
    
    lastScrollY.current = currentY;
  }, [headerAnimatedValue]);

  // Animated header values - spring-based for smoothness
  const headerOpacity = headerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const headerTranslateY = headerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(HEADER_HEIGHT + insets.top + 30)],
  });

  const compactHeaderOpacity = headerAnimatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const headerTop = insets.top;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Compact Header - appears on scroll */}
      <Animated.View
        style={[
          styles.compactHeader,
          { opacity: compactHeaderOpacity },
        ]}
        pointerEvents="box-none"
      >
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <View style={[styles.compactHeaderContent, { backgroundColor: primaryColor + "E8", paddingTop: headerTop + Spacing.xs }]}>
            <ThemedText style={styles.compactTitle} numberOfLines={1}>
              Your Birth Tracker
            </ThemedText>
            <View style={styles.compactActions}>
              {streakData.currentStreak > 0 && (
                <View style={styles.compactStreakBadge}>
                  <MaterialCommunityIcons 
                    name="fire" 
                    size={16} 
                    color={isAtRisk ? "#FCD34D" : "#FF6B35"} 
                  />
                  <ThemedText style={styles.compactStreakCount}>
                    {streakData.currentStreak}
                  </ThemedText>
                </View>
              )}
              <Pressable
                onPress={openMenu}
                style={({ pressed }) => [
                  styles.compactMenuButton,
                  pressed && styles.menuButtonPressed,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="menu" size={20} color="white" />
              </Pressable>
            </View>
          </View>
        </BlurView>
      </Animated.View>

      {/* Main Header - visible at top */}
      <Animated.View
        style={[
          styles.mainHeader,
          { 
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={[primaryColor, primaryColor + "90"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: headerTop + Spacing.sm }]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.greeting} numberOfLines={1}>
                {getGreeting()} {getEmoji()}
              </ThemedText>
              <ThemedText
                style={styles.headerTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                Your Birth Tracker
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              {streakData.currentStreak > 0 && (
                <View style={[styles.streakBadge, isAtRisk && styles.streakBadgeAtRisk]}>
                  <MaterialCommunityIcons 
                    name="fire" 
                    size={18} 
                    color={isAtRisk ? "#FCD34D" : "#FF6B35"} 
                  />
                  <ThemedText style={styles.streakCount}>
                    {streakData.currentStreak}
                  </ThemedText>
                </View>
              )}
              <Pressable
                onPress={openMenu}
                style={({ pressed }) => [
                  styles.menuButton,
                  pressed && styles.menuButtonPressed,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="menu" size={22} color="white" />
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContentContainer, { paddingTop: headerTop + 140 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            progressViewOffset={headerTop + 100}
          />
        }
      >

        {/* Quick Stats Overview */}
        <View style={styles.quickStatsContainer}>
          <View
            style={[styles.quickStatCard, { backgroundColor: surfaceColor }]}
          >
            <View
              style={[
                styles.quickStatIconContainer,
                {
                  backgroundColor: '#3B82F6' + "20",
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
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
                  backgroundColor: '#8B5CF6' + "20",
                },
              ]}
            >
              <Ionicons
                name="calendar"
                size={24}
                color="#8B5CF6"
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

          <View
            style={[styles.quickStatCard, { backgroundColor: surfaceColor }]}
          >
            <View
              style={[
                styles.quickStatIconContainer,
                {
                  backgroundColor: '#10B981' + "20",
                },
              ]}
            >
              <Ionicons
                name="stats-chart"
                size={24}
                color="#10B981"
              />
            </View>
            <ThemedText
              style={[styles.quickStatValue, { color: textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {yearCount}
            </ThemedText>
            <ThemedText
              style={[styles.quickStatLabel, { color: textSecondaryColor }]}
              numberOfLines={1}
            >
              This Year
            </ThemedText>
          </View>
        </View>

        {/* Streak Progress Card */}
        <View style={styles.streakCardContainer}>
          <StreakProgressCard
            streakData={streakData}
            status={status}
            weekProgress={weekProgress}
            nextMilestone={nextMilestone}
            loggedDates={loggedDates}
            onPress={() => router.push("/streaks")}
          />
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
          
          {/* Secondary Actions Row */}
          <View style={styles.secondaryActionsRow}>
            {/* Achievements Button */}
            <Pressable
              accessibilityLabel="View achievements and progress"
              accessibilityRole="button"
              onPress={() => router.push("/achievements")}
              style={({ pressed }) => [
                styles.secondaryActionButton,
                { backgroundColor: primaryColor + "15" },
                pressed && styles.secondaryActionButtonPressed,
              ]}
            >
              <Ionicons name="trophy" size={20} color={primaryColor} />
              <ThemedText
                style={[styles.secondaryActionLabel, { color: primaryColor }]}
                numberOfLines={1}
              >
                Achievements
              </ThemedText>
            </Pressable>

            {/* Share Stats Button */}
            <Pressable
              accessibilityLabel="Share your stats"
              accessibilityRole="button"
              onPress={() => setShowSharePicker(true)}
              style={({ pressed }) => [
                styles.secondaryActionButton,
                { backgroundColor: "#8B5CF6" + "15" },
                pressed && styles.secondaryActionButtonPressed,
              ]}
            >
              <Ionicons name="share-social" size={20} color="#8B5CF6" />
              <ThemedText
                style={[styles.secondaryActionLabel, { color: "#8B5CF6" }]}
                numberOfLines={1}
              >
                Share Stats
              </ThemedText>
            </Pressable>
          </View>
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
      </Animated.ScrollView>

      {/* Share Stats Picker Modal */}
      <Modal
        visible={showSharePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSharePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={() => setShowSharePicker(false)}
          />
          <View style={[styles.pickerModalContent, { backgroundColor: surfaceColor }]}>
            <ThemedText style={[styles.pickerTitle, { color: textColor }]}>
              Share Your Stats
            </ThemedText>
            <ThemedText style={[styles.pickerSubtitle, { color: textSecondaryColor }]}>
              Choose a time period to share
            </ThemedText>
            
            <View style={styles.pickerOptions}>
              <Pressable
                style={[styles.pickerOption, { backgroundColor: '#3B82F6' + '15' }]}
                onPress={() => {
                  setShowSharePicker(false);
                  setSelectedStatsPeriod('week');
                }}
              >
                <View style={[styles.pickerOptionIcon, { backgroundColor: '#3B82F6' + '25' }]}>
                  <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                </View>
                <View style={styles.pickerOptionText}>
                  <ThemedText style={[styles.pickerOptionTitle, { color: textColor }]}>This Week</ThemedText>
                  <ThemedText style={[styles.pickerOptionValue, { color: '#3B82F6' }]}>{weekCount} babies</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
              </Pressable>

              <Pressable
                style={[styles.pickerOption, { backgroundColor: '#8B5CF6' + '15' }]}
                onPress={() => {
                  setShowSharePicker(false);
                  setSelectedStatsPeriod('month');
                }}
              >
                <View style={[styles.pickerOptionIcon, { backgroundColor: '#8B5CF6' + '25' }]}>
                  <Ionicons name="calendar" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.pickerOptionText}>
                  <ThemedText style={[styles.pickerOptionTitle, { color: textColor }]}>This Month</ThemedText>
                  <ThemedText style={[styles.pickerOptionValue, { color: '#8B5CF6' }]}>{monthCount} babies</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
              </Pressable>

              <Pressable
                style={[styles.pickerOption, { backgroundColor: '#10B981' + '15' }]}
                onPress={() => {
                  setShowSharePicker(false);
                  setSelectedStatsPeriod('year');
                }}
              >
                <View style={[styles.pickerOptionIcon, { backgroundColor: '#10B981' + '25' }]}>
                  <Ionicons name="stats-chart" size={24} color="#10B981" />
                </View>
                <View style={styles.pickerOptionText}>
                  <ThemedText style={[styles.pickerOptionTitle, { color: textColor }]}>This Year</ThemedText>
                  <ThemedText style={[styles.pickerOptionValue, { color: '#10B981' }]}>{yearCount} babies</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
              </Pressable>

              <Pressable
                style={[styles.pickerOption, { backgroundColor: '#F59E0B' + '15' }]}
                onPress={() => {
                  setShowSharePicker(false);
                  setSelectedStatsPeriod('lifetime');
                }}
              >
                <View style={[styles.pickerOptionIcon, { backgroundColor: '#F59E0B' + '25' }]}>
                  <MaterialCommunityIcons name="infinity" size={24} color="#F59E0B" />
                </View>
                <View style={styles.pickerOptionText}>
                  <ThemedText style={[styles.pickerOptionTitle, { color: textColor }]}>Lifetime</ThemedText>
                  <ThemedText style={[styles.pickerOptionValue, { color: '#F59E0B' }]}>{totalDeliveries} babies</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
              </Pressable>
            </View>

            <Pressable
              style={[styles.pickerCancelButton, { backgroundColor: backgroundColor }]}
              onPress={() => setShowSharePicker(false)}
            >
              <ThemedText style={[styles.pickerCancelText, { color: textSecondaryColor }]}>Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Stats Share Preview Modal */}
      <Modal
        visible={selectedStatsPeriod !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedStatsPeriod(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={() => !isSharing && setSelectedStatsPeriod(null)}
          />
          <View style={styles.modalContent}>
            {selectedStatsPeriod && (
              <StatsShareCard
                ref={statsShareCardRef}
                count={getStatsCount(selectedStatsPeriod)}
                period={selectedStatsPeriod}
              />
            )}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.shareButton, { backgroundColor: primaryColor }]}
                onPress={handleShareStats}
                disabled={isSharing}
              >
                {isSharing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={20} color="white" />
                    <ThemedText style={styles.shareButtonText}>Share</ThemedText>
                  </>
                )}
              </Pressable>
              <Pressable
                style={[styles.cancelButton, { backgroundColor: surfaceColor }]}
                onPress={() => setSelectedStatsPeriod(null)}
                disabled={isSharing}
              >
                <ThemedText style={[styles.cancelButtonText, { color: textColor }]}>Cancel</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Streak Milestone Celebration Modal */}
      <StreakMilestoneModal
        visible={showMilestoneModal}
        milestone={currentMilestone ?? 4}
        onDismiss={() => {
          setShowMilestoneModal(false);
          setCurrentMilestone(null);
        }}
        onShare={() => {
          // TODO: Implement share streak milestone
          setShowMilestoneModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Compact header (appears on scroll)
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  compactHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  compactTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
    color: 'white',
    letterSpacing: Typography.letterSpacing.tight,
  },
  compactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compactStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  compactStreakCount: {
    color: 'white',
    fontSize: Typography.sm,
    fontWeight: Typography.weights.bold,
  },
  compactMenuButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Main header (visible at top)
  mainHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: Spacing.xl + Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  greeting: {
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ scale: 0.95 }],
  },
  
  scrollContentContainer: {
    paddingBottom: 120,
  },
  streakCardContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  quickStatsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
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
  secondaryActionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  secondaryActionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  secondaryActionLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: BorderRadius.full,
    gap: 4,
    height: 36,
  },
  streakBadgeAtRisk: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
  },
  streakCount: {
    color: 'white',
    fontSize: Typography.sm,
    fontWeight: Typography.weights.bold,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    minWidth: 120,
  },
  shareButtonText: {
    color: "white",
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  cancelButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
  },
  pickerModalContent: {
    backgroundColor: "white",
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    width: "90%",
    maxWidth: 400,
  },
  pickerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  pickerSubtitle: {
    fontSize: Typography.sm,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  pickerOptions: {
    gap: Spacing.sm,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  pickerOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerOptionText: {
    flex: 1,
  },
  pickerOptionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  pickerOptionValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  pickerCancelButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  pickerCancelText: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
  },
});
