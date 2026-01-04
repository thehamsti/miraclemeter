import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, Platform } from 'react-native';
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
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');

  const recapYear = 2025;
  const recapEntry = yearlyBabyCounts.find((entry) => entry.year === recapYear);
  const recapCount = recapEntry ? recapEntry.babies : 0;
  const averageBabies = totalDeliveries > 0 ? Math.round((totalBabies / totalDeliveries) * 10) / 10 : 0;

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
            colors={[primaryColor, primaryColor + '90']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
          >
            <Pressable
              onPress={() => router.back()}
              style={styles.closeButton}
              accessibilityLabel="Close recap"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={primaryButtonTextColor} />
            </Pressable>
            <ThemedText style={[styles.headerEyebrow, { color: primaryButtonTextColor }]}>
              Miracle Meter Recap
            </ThemedText>
            <ThemedText style={[styles.headerTitle, { color: primaryButtonTextColor }]}>
              Your 2025 Story
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: primaryButtonTextColor }]}>
              A quick wrap of your deliveries, babies, and standout moments.
            </ThemedText>
          </LinearGradient>

          <View style={styles.cardGrid}>
            <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.statIcon, { backgroundColor: successColor + '20' }]}>
                <Ionicons name="sparkles" size={22} color={successColor} />
              </View>
              <ThemedText style={[styles.statValue, { color: textColor }]}>{recapCount}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                Babies in 2025
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.statIcon, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="people-outline" size={22} color={primaryColor} />
              </View>
              <ThemedText style={[styles.statValue, { color: textColor }]}>{totalBabies}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                Babies logged
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.statIcon, { backgroundColor: warningColor + '20' }]}>
                <Ionicons name="calendar-outline" size={22} color={warningColor} />
              </View>
              <ThemedText style={[styles.statValue, { color: textColor }]}>{totalDeliveries}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                Deliveries tracked
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.statIcon, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="trending-up-outline" size={22} color={primaryColor} />
              </View>
              <ThemedText style={[styles.statValue, { color: textColor }]}>{averageBabies}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                Avg per delivery
              </ThemedText>
            </View>
          </View>

          <View style={styles.highlightSection}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Highlight of the Year
            </ThemedText>
            <View style={[styles.highlightCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.highlightIcon, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="trophy-outline" size={24} color={primaryColor} />
              </View>
              <View style={styles.highlightContent}>
                <ThemedText style={[styles.highlightTitle, { color: textColor }]}>
                  Best year so far
                </ThemedText>
                <ThemedText style={[styles.highlightSubtitle, { color: textSecondaryColor }]}>
                  {topYearLabel} led with {topYearCount} babies
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
  highlightSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
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
