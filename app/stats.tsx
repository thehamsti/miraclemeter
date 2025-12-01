import React, { useCallback } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, Dimensions, View, Platform, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { BirthRecord } from '@/types';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StatCard } from '@/components/StatCard';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';
import { useStatistics } from '@/hooks/useStatistics';

export default function StatsScreen() {
  const {
    records: birthRecords,
    totalDeliveries,
    genderCounts: genderStats,
    deliveryCounts: deliveryStats,
    loading,
  } = useStatistics();

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const maleColor = useThemeColor({}, 'male');
  const femaleColor = useThemeColor({}, 'female');
  const warningColor = useThemeColor({}, 'warning');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

  useFocusEffect(
    useCallback(() => {
      // Statistics are loaded by the useStatistics hook
      return () => {}; // Optional cleanup function
    }, [])
  );

  const screenWidth = Dimensions.get('window').width;

  const totalBabies = genderStats.boys + genderStats.girls + genderStats.angels;

  const genderData = [
    { 
      name: 'Boys', 
      population: genderStats.boys, 
      color: maleColor, 
      legendFontColor: textColor,
      percentage: totalBabies > 0 ? Math.round((genderStats.boys / totalBabies) * 100) : 0
    },
    { 
      name: 'Girls', 
      population: genderStats.girls, 
      color: femaleColor, 
      legendFontColor: textColor,
      percentage: totalBabies > 0 ? Math.round((genderStats.girls / totalBabies) * 100) : 0
    },
    { 
      name: 'Angels', 
      population: genderStats.angels, 
      color: warningColor, 
      legendFontColor: textColor,
      percentage: totalBabies > 0 ? Math.round((genderStats.angels / totalBabies) * 100) : 0
    },
  ].filter(item => item.population > 0);

  const deliveryData = {
    labels: ['Vaginal', 'C-Section', 'Unknown'].filter((_, idx) => 
      [deliveryStats.vaginal, deliveryStats.cSection, deliveryStats.unknown][idx] > 0
    ),
    datasets: [{
      data: [deliveryStats.vaginal, deliveryStats.cSection, deliveryStats.unknown].filter(val => val > 0),
      colors: [
        (opacity = 1) => successColor + Math.round(opacity * 255).toString(16).padStart(2, '0'),
        (opacity = 1) => primaryColor + Math.round(opacity * 255).toString(16).padStart(2, '0'),
        (opacity = 1) => errorColor + Math.round(opacity * 255).toString(16).padStart(2, '0'),
      ].slice(0, [deliveryStats.vaginal, deliveryStats.cSection, deliveryStats.unknown].filter(val => val > 0).length)
    }]
  };

  const chartConfig = {
    backgroundGradientFrom: backgroundColor,
    backgroundGradientTo: backgroundColor,
    color: (opacity = 1) => primaryColor + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    strokeWidth: 3,
    barPercentage: 0.7,
    decimalPlaces: 0,
    fillShadowGradient: primaryColor,
    fillShadowGradientOpacity: 0.3,
    propsForLabels: {
      fontSize: Typography.sm,
      fontWeight: Typography.weights.medium,
    },
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
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
                  Your Delivery
                </ThemedText>
                <ThemedText style={[styles.headerTitle, { color: 'white' }]}>
                  Statistics Overview
                </ThemedText>
              </View>
              <View style={[styles.headerStatsContainer, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <ThemedText style={[styles.headerStatsValue, { color: 'white' }]}>
                  {totalDeliveries}
                </ThemedText>
                <ThemedText style={[styles.headerStatsLabel, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                  Total
                </ThemedText>
              </View>
            </View>
          </LinearGradient>

          {/* Key Metrics Cards */}
          <View style={styles.metricsContainer}>
            <View style={[styles.metricCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.metricIconContainer, { backgroundColor: successColor + '20' }]}>
                <Ionicons name="happy-outline" size={28} color={successColor} />
              </View>
              <View style={styles.metricContent}>
                <ThemedText style={[styles.metricValue, { color: textColor }]}>
                  {totalBabies}
                </ThemedText>
                <ThemedText style={[styles.metricLabel, { color: textSecondaryColor }]}>
                  Total Babies
                </ThemedText>
              </View>
            </View>

            <View style={[styles.metricCard, { backgroundColor: surfaceColor }]}>
              <View style={[styles.metricIconContainer, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="time-outline" size={28} color={primaryColor} />
              </View>
              <View style={styles.metricContent}>
                <ThemedText style={[styles.metricValue, { color: textColor }]}>
                  {totalDeliveries > 0 ? Math.round(totalBabies / totalDeliveries * 10) / 10 : 0}
                </ThemedText>
                <ThemedText style={[styles.metricLabel, { color: textSecondaryColor }]}>
                  Avg per Delivery
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Gender Distribution Section */}
          {totalBabies > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Gender Distribution
                </ThemedText>
                <View style={[styles.totalBadge, { backgroundColor: primaryColor + '15' }]}>
                  <ThemedText style={[styles.totalBadgeText, { color: primaryColor }]}>
                    {totalBabies} babies
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.chartCard, { backgroundColor: surfaceColor }]}>
                {genderData.length > 0 ? (
                  <PieChart
                    data={genderData}
                    width={screenWidth - 64}
                    height={240}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                    hasLegend={false}
                  />
                ) : (
                  <View style={styles.emptyChart}>
                    <Ionicons name="pie-chart-outline" size={48} color={textSecondaryColor} />
                    <ThemedText style={[styles.emptyChartText, { color: textSecondaryColor }]}>
                      No data to display
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Gender Legend */}
              <View style={styles.legendContainer}>
                {genderData.map((item, index) => (
                  <View key={index} style={[styles.legendItem, { backgroundColor: surfaceColor }]}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <View style={styles.legendText}>
                      <ThemedText style={[styles.legendValue, { color: textColor }]}>
                        {item.population}
                      </ThemedText>
                      <ThemedText style={[styles.legendLabel, { color: textSecondaryColor }]}>
                        {item.name} ({item.percentage}%)
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Delivery Types Section */}
          {totalDeliveries > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Delivery Methods
                </ThemedText>
                <View style={[styles.totalBadge, { backgroundColor: successColor + '15' }]}>
                  <ThemedText style={[styles.totalBadgeText, { color: successColor }]}>
                    {totalDeliveries} deliveries
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.chartCard, { backgroundColor: surfaceColor }]}>
                {deliveryData.datasets[0].data.length > 0 ? (
                  <BarChart
                    data={deliveryData}
                    width={screenWidth - 64}
                    height={240}
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    showValuesOnTopOfBars
                    fromZero
                    yAxisLabel=""
                    yAxisSuffix=""
                    withInnerLines={false}
                    withCustomBarColorFromData
                  />
                ) : (
                  <View style={styles.emptyChart}>
                    <Ionicons name="bar-chart-outline" size={48} color={textSecondaryColor} />
                    <ThemedText style={[styles.emptyChartText, { color: textSecondaryColor }]}>
                      No data to display
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Delivery Stats Cards */}
              <View style={styles.deliveryStatsGrid}>
                {deliveryStats.vaginal > 0 && (
                  <View style={[styles.deliveryStatCard, { backgroundColor: surfaceColor, borderLeftColor: successColor }]}>
                    <Ionicons name="fitness-outline" size={24} color={successColor} />
                    <View style={styles.deliveryStatContent}>
                      <ThemedText style={[styles.deliveryStatValue, { color: textColor }]}>
                        {deliveryStats.vaginal}
                      </ThemedText>
                      <ThemedText style={[styles.deliveryStatLabel, { color: textSecondaryColor }]}>
                        Vaginal ({Math.round((deliveryStats.vaginal / totalDeliveries) * 100)}%)
                      </ThemedText>
                    </View>
                  </View>
                )}

                {deliveryStats.cSection > 0 && (
                  <View style={[styles.deliveryStatCard, { backgroundColor: surfaceColor, borderLeftColor: primaryColor }]}>
                    <Ionicons name="medical-outline" size={24} color={primaryColor} />
                    <View style={styles.deliveryStatContent}>
                      <ThemedText style={[styles.deliveryStatValue, { color: textColor }]}>
                        {deliveryStats.cSection}
                      </ThemedText>
                      <ThemedText style={[styles.deliveryStatLabel, { color: textSecondaryColor }]}>
                        C-Section ({Math.round((deliveryStats.cSection / totalDeliveries) * 100)}%)
                      </ThemedText>
                    </View>
                  </View>
                )}

                {deliveryStats.unknown > 0 && (
                  <View style={[styles.deliveryStatCard, { backgroundColor: surfaceColor, borderLeftColor: errorColor }]}>
                    <Ionicons name="help-circle-outline" size={24} color={errorColor} />
                    <View style={styles.deliveryStatContent}>
                      <ThemedText style={[styles.deliveryStatValue, { color: textColor }]}>
                        {deliveryStats.unknown}
                      </ThemedText>
                      <ThemedText style={[styles.deliveryStatLabel, { color: textSecondaryColor }]}>
                        Unknown ({Math.round((deliveryStats.unknown / totalDeliveries) * 100)}%)
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Empty State */}
          {totalDeliveries === 0 && (
            <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
              <View style={[styles.emptyIconContainer, { backgroundColor: primaryColor + '10' }]}>
                <Ionicons name="analytics-outline" size={64} color={primaryColor} />
              </View>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                No Statistics Yet
              </ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: textSecondaryColor }]}>
                Start tracking births to see your delivery statistics and insights here.
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  metricIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
  },
  metricLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
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
  chartCard: {
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyChartText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  legendContainer: {
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
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
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
  },
  legendText: {
    flex: 1,
  },
  legendValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.bold,
  },
  legendLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
  },
  deliveryStatsGrid: {
    gap: Spacing.md,
  },
  deliveryStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
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
  deliveryStatContent: {
    flex: 1,
  },
  deliveryStatValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
  },
  deliveryStatLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
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
