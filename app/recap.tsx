import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useStatistics } from '@/hooks/useStatistics';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/Colors';

export default function RecapScreen() {
  const insets = useSafeAreaInsets();
  const { totalBabies, totalDeliveries, yearlyBabyCounts } = useStatistics();

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const maleColor = useThemeColor({}, 'male');
  const femaleColor = useThemeColor({}, 'female');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');

  const recapYear = 2025;
  const recapEntry = yearlyBabyCounts.find((entry) => entry.year === recapYear);
  const recapCount = recapEntry ? recapEntry.babies : 0;
  const averageBabies = totalDeliveries > 0 ? Math.round((totalBabies / totalDeliveries) * 10) / 10 : 0;

  const floatAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnimation, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnimation]);

  const floatUp = floatAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const floatDown = floatAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  let topYearLabel = '—';
  let topYearCount = 0;
  for (const entry of yearlyBabyCounts) {
    if (entry.babies > topYearCount) {
      topYearCount = entry.babies;
      topYearLabel = entry.year.toString();
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[primaryColor, successColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
          >
            <View style={styles.floatingIcons} pointerEvents="none">
              <Animated.View
                style={[
                  styles.floatingIcon,
                  styles.floatOne,
                  { backgroundColor: primaryLight, transform: [{ translateY: floatUp }] },
                ]}
              >
                <Ionicons name="star" size={26} color={primaryButtonTextColor} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.floatingIcon,
                  styles.floatTwo,
                  { backgroundColor: primaryLight, transform: [{ translateY: floatDown }] },
                ]}
              >
                <Ionicons name="heart" size={24} color={primaryButtonTextColor} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.floatingIcon,
                  styles.floatThree,
                  { backgroundColor: primaryLight, transform: [{ translateY: floatUp }] },
                ]}
              >
                <Ionicons name="sparkles" size={22} color={primaryButtonTextColor} />
              </Animated.View>
            </View>
            <Pressable
              onPress={() => router.back()}
              style={styles.closeButton}
              accessibilityLabel="Close recap"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={primaryButtonTextColor} />
            </Pressable>
            <ThemedText style={[styles.headerEyebrow, { color: primaryButtonTextColor }]}>
              Miracle Meter Wrap
            </ThemedText>
            <ThemedText style={[styles.headerTitle, { color: primaryButtonTextColor }]}>
              Your 2025 Baby Wrap
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: primaryButtonTextColor }]}>
              Sparkly highlights, biggest moments, and all the baby joy.
            </ThemedText>
            <View style={styles.headerBadges}>
              <View style={[styles.headerBadge, { backgroundColor: primaryLight }]}>
                <Ionicons name="flash-outline" size={16} color={primaryColor} />
                <ThemedText style={[styles.headerBadgeText, { color: primaryColor }]}>
                  Tiny wins
                </ThemedText>
              </View>
              <View style={[styles.headerBadge, { backgroundColor: primaryLight }]}>
                <Ionicons name="balloon-outline" size={16} color={primaryColor} />
                <ThemedText style={[styles.headerBadgeText, { color: primaryColor }]}>
                  Big moments
                </ThemedText>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.cardGrid}>
            <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.statIcon, { backgroundColor: successColor + '20' }]}>
                <Ionicons name="sparkles" size={22} color={successColor} />
              </View>
              <ThemedText style={[styles.statValue, { color: textColor }]}>{recapEntry?.babies ?? 0}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                Babies in 2025
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.statIcon, { backgroundColor: warningColor + '20' }]}>
                <Ionicons name="calendar-outline" size={22} color={warningColor} />
              </View>
              <ThemedText style={[styles.statValue, { color: textColor }]}>{recapEntry?.deliveries.total ?? 0}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                Deliveries in 2025
              </ThemedText>
            </View>
          </View>

          {recapEntry && (
            <View style={styles.breakdownSection}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                2025 Breakdown
              </ThemedText>

              <View style={[styles.breakdownCard, { backgroundColor: surfaceColor }]}>
                <ThemedText style={[styles.breakdownLabel, { color: textSecondaryColor }]}>
                  Gender Split
                </ThemedText>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItem}>
                    <View style={[styles.breakdownDot, { backgroundColor: maleColor }]} />
                    <ThemedText style={[styles.breakdownItemValue, { color: textColor }]}>
                      {recapEntry.genders.boys}
                    </ThemedText>
                    <ThemedText style={[styles.breakdownItemLabel, { color: textSecondaryColor }]}>
                      boys
                    </ThemedText>
                  </View>
                  <View style={styles.breakdownItem}>
                    <View style={[styles.breakdownDot, { backgroundColor: femaleColor }]} />
                    <ThemedText style={[styles.breakdownItemValue, { color: textColor }]}>
                      {recapEntry.genders.girls}
                    </ThemedText>
                    <ThemedText style={[styles.breakdownItemLabel, { color: textSecondaryColor }]}>
                      girls
                    </ThemedText>
                  </View>
                  {recapEntry.genders.angels > 0 && (
                    <View style={styles.breakdownItem}>
                      <View style={[styles.breakdownDot, { backgroundColor: warningColor }]} />
                      <ThemedText style={[styles.breakdownItemValue, { color: textColor }]}>
                        {recapEntry.genders.angels}
                      </ThemedText>
                      <ThemedText style={[styles.breakdownItemLabel, { color: textSecondaryColor }]}>
                        angels
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>

              <View style={[styles.breakdownCard, { backgroundColor: surfaceColor }]}>
                <ThemedText style={[styles.breakdownLabel, { color: textSecondaryColor }]}>
                  Delivery Types
                </ThemedText>
                <View style={styles.breakdownRow}>
                  {recapEntry.deliveries.vaginal > 0 && (
                    <View style={styles.breakdownItem}>
                      <View style={[styles.breakdownDot, { backgroundColor: successColor }]} />
                      <ThemedText style={[styles.breakdownItemValue, { color: textColor }]}>
                        {recapEntry.deliveries.vaginal}
                      </ThemedText>
                      <ThemedText style={[styles.breakdownItemLabel, { color: textSecondaryColor }]}>
                        vaginal
                      </ThemedText>
                    </View>
                  )}
                  {recapEntry.deliveries.cSection > 0 && (
                    <View style={styles.breakdownItem}>
                      <View style={[styles.breakdownDot, { backgroundColor: primaryColor }]} />
                      <ThemedText style={[styles.breakdownItemValue, { color: textColor }]}>
                        {recapEntry.deliveries.cSection}
                      </ThemedText>
                      <ThemedText style={[styles.breakdownItemLabel, { color: textSecondaryColor }]}>
                        c-section
                      </ThemedText>
                    </View>
                  )}
                  {recapEntry.deliveries.unknown > 0 && (
                    <View style={styles.breakdownItem}>
                      <View style={[styles.breakdownDot, { backgroundColor: textSecondaryColor }]} />
                      <ThemedText style={[styles.breakdownItemValue, { color: textColor }]}>
                        {recapEntry.deliveries.unknown}
                      </ThemedText>
                      <ThemedText style={[styles.breakdownItemLabel, { color: textSecondaryColor }]}>
                        unknown
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={styles.highlightSection}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              All-Time Stats
            </ThemedText>
            <View style={[styles.highlightCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.highlightIcon, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="people-outline" size={24} color={primaryColor} />
              </View>
              <View style={styles.highlightContent}>
                <ThemedText style={[styles.highlightTitle, { color: textColor }]}>
                  {totalBabies} babies total
                </ThemedText>
                <ThemedText style={[styles.highlightSubtitle, { color: textSecondaryColor }]}>
                  Across {totalDeliveries} deliveries
                </ThemedText>
              </View>
            </View>
            <View style={[styles.highlightCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.highlightIcon, { backgroundColor: warningColor + '20' }]}>
                <Ionicons name="trophy-outline" size={24} color={warningColor} />
              </View>
              <View style={styles.highlightContent}>
                <ThemedText style={[styles.highlightTitle, { color: textColor }]}>
                  Best year: {topYearLabel}
                </ThemedText>
                <ThemedText style={[styles.highlightSubtitle, { color: textSecondaryColor }]}>
                  {topYearCount} babies recorded
                </ThemedText>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/stats')}
            accessibilityLabel="View full statistics"
            accessibilityRole="button"
            style={styles.statsButton}
          >
            <LinearGradient
              colors={[primaryColor, primaryColor + 'E6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsButtonGradient}
            >
              <ThemedText style={[styles.statsButtonText, { color: primaryButtonTextColor }]}>
                View full stats
              </ThemedText>
              <Ionicons name="arrow-forward" size={18} color={primaryButtonTextColor} />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  floatingIcons: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingIcon: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  floatOne: {
    top: Spacing.lg,
    left: Spacing.lg,
  },
  floatTwo: {
    top: Spacing.xl,
    right: Spacing.xl,
  },
  floatThree: {
    bottom: Spacing.lg,
    right: Spacing.lg,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  headerEyebrow: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: Typography.base,
    marginTop: Spacing.sm,
    lineHeight: Typography.lineHeights.base,
  },
  headerBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  headerBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.semibold,
  },
  cardGrid: {
    marginTop: -Spacing.xl,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
  },
  statLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  breakdownSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  breakdownCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
    ...Platform.select({
      ios: {
        ...Shadows.sm,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  breakdownLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
  },
  breakdownItemValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.bold,
  },
  breakdownItemLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  highlightSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  highlightIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  highlightSubtitle: {
    fontSize: Typography.sm,
    marginTop: Spacing.xs,
  },
  statsButton: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        ...Shadows.lg,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  statsButtonText: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
  },
});
