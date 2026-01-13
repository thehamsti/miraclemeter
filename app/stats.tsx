import React, { useCallback, useState, useRef } from 'react';
import { StyleSheet, ScrollView, Dimensions, View, Platform, Pressable, Modal, Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { StatsShareCard, StatsPeriod } from '@/components/StatsShareCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useStatistics } from '@/hooks/useStatistics';
import { captureAndShareStats } from '@/services/shareCard';

export default function StatsScreen() {
  const [showSharePicker, setShowSharePicker] = useState(false);
  const [selectedStatsPeriod, setSelectedStatsPeriod] = useState<StatsPeriod | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const statsShareCardRef = useRef<View>(null!);

  const {
    totalDeliveries,
    weekCount,
    monthCount,
    yearCount,
    genderCounts: genderStats,
    deliveryCounts: deliveryStats,
    yearlyBabyCounts,
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
        <ScrollView showsVerticalScrollIndicator={false} bounces={true} contentContainerStyle={{ paddingTop: 60 }}>
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

          {/* Share Stats Button */}
          <View style={styles.shareStatsContainer}>
            <Pressable
              style={[styles.shareStatsButton, { backgroundColor: surfaceColor }]}
              onPress={() => setShowSharePicker(true)}
              accessibilityLabel="Share your stats"
              accessibilityRole="button"
            >
              <View style={[styles.shareStatsIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                <Ionicons name="share-social" size={22} color="#8B5CF6" />
              </View>
              <View style={styles.shareStatsText}>
                <ThemedText style={[styles.shareStatsTitle, { color: textColor }]}>
                  Share Your Stats
                </ThemedText>
                <ThemedText style={[styles.shareStatsSubtitle, { color: textSecondaryColor }]}>
                  Create a shareable image of your stats
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
            </Pressable>
          </View>

          {yearlyBabyCounts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Yearly Breakdown
                </ThemedText>
                <View style={[styles.totalBadge, { backgroundColor: primaryColor + '15' }]}>
                  <ThemedText style={[styles.totalBadgeText, { color: primaryColor }]}>
                    {yearlyBabyCounts.length} years
                  </ThemedText>
                </View>
              </View>

              <View style={styles.yearlyList}>
                {yearlyBabyCounts.map((entry) => (
                  <View key={entry.year} style={[styles.yearlyCard, { backgroundColor: surfaceColor }]}>
                    <View style={styles.yearlyCardHeader}>
                      <ThemedText style={[styles.yearlyYearText, { color: textColor }]}>
                        {entry.year}
                      </ThemedText>
                      <ThemedText style={[styles.yearlyBabyCount, { color: primaryColor }]}>
                        {entry.babies} {entry.babies === 1 ? 'baby' : 'babies'}
                      </ThemedText>
                    </View>

                    <View style={styles.yearlyBreakdown}>
                      <View style={styles.yearlyBreakdownRow}>
                        <View style={styles.yearlyBreakdownItem}>
                          <Ionicons name="male" size={14} color={maleColor} />
                          <ThemedText style={[styles.yearlyBreakdownText, { color: textSecondaryColor }]}>
                            {entry.genders.boys}
                          </ThemedText>
                        </View>
                        <View style={styles.yearlyBreakdownItem}>
                          <Ionicons name="female" size={14} color={femaleColor} />
                          <ThemedText style={[styles.yearlyBreakdownText, { color: textSecondaryColor }]}>
                            {entry.genders.girls}
                          </ThemedText>
                        </View>
                        {entry.genders.angels > 0 && (
                          <View style={styles.yearlyBreakdownItem}>
                            <Ionicons name="star" size={14} color={warningColor} />
                            <ThemedText style={[styles.yearlyBreakdownText, { color: textSecondaryColor }]}>
                              {entry.genders.angels}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                      <View style={styles.yearlyBreakdownRow}>
                        {entry.deliveries.vaginal > 0 && (
                          <View style={styles.yearlyBreakdownItem}>
                            <Ionicons name="fitness-outline" size={14} color={successColor} />
                            <ThemedText style={[styles.yearlyBreakdownText, { color: textSecondaryColor }]}>
                              {entry.deliveries.vaginal}
                            </ThemedText>
                          </View>
                        )}
                        {entry.deliveries.cSection > 0 && (
                          <View style={styles.yearlyBreakdownItem}>
                            <Ionicons name="medical-outline" size={14} color={primaryColor} />
                            <ThemedText style={[styles.yearlyBreakdownText, { color: textSecondaryColor }]}>
                              {entry.deliveries.cSection}
                            </ThemedText>
                          </View>
                        )}
                        <ThemedText style={[styles.yearlyDeliveryTotal, { color: textSecondaryColor }]}>
                          {entry.deliveries.total} {entry.deliveries.total === 1 ? 'delivery' : 'deliveries'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

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
                    <Ionicons name="infinite" size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.pickerOptionText}>
                    <ThemedText style={[styles.pickerOptionTitle, { color: textColor }]}>Lifetime</ThemedText>
                    <ThemedText style={[styles.pickerOptionValue, { color: '#F59E0B' }]}>{totalDeliveries} babies</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
                </Pressable>
              </View>

              <Pressable
                style={[styles.pickerCancelButton, { backgroundColor }]}
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 80 : 56,
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
  yearlyList: {
    gap: Spacing.md,
  },
  yearlyCard: {
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
  yearlyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearlyYearText: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
  },
  yearlyBabyCount: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  yearlyBreakdown: {
    gap: Spacing.sm,
  },
  yearlyBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  yearlyBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  yearlyBreakdownText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  yearlyDeliveryTotal: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
    marginLeft: 'auto',
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
  shareStatsContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  shareStatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
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
  shareStatsIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareStatsText: {
    flex: 1,
  },
  shareStatsTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  shareStatsSubtitle: {
    fontSize: Typography.sm,
    marginTop: 2,
  },
  pickerModalContent: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  pickerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  pickerSubtitle: {
    fontSize: Typography.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  pickerOptions: {
    gap: Spacing.sm,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  pickerOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    minWidth: 120,
  },
  shareButtonText: {
    color: 'white',
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
});
