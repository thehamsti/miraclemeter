import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getBirthRecords } from '@/services/storage';
import { BirthRecord } from '@/types';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StatCard } from '@/components/StatCard';
import { BarChart, PieChart } from 'react-native-chart-kit';

export default function StatsScreen() {
  const [birthRecords, setBirthRecords] = useState<BirthRecord[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [genderStats, setGenderStats] = useState({ boys: 0, girls: 0, angels: 0 });
  const [deliveryStats, setDeliveryStats] = useState({ vaginal: 0, csection: 0 });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const loadStats = useCallback(async () => {
    try {
      const records = await getBirthRecords();
      setBirthRecords(records);

      // Calculate gender statistics
      let boys = 0, girls = 0, angels = 0;
      records.forEach(record => {
        record.babies.forEach(baby => {
          if (baby.gender === 'boy') boys++;
          if (baby.gender === 'girl') girls++;
          if (baby.gender === 'angel') angels++;
        });
      });
      setGenderStats({ boys, girls, angels });

      // Calculate delivery type statistics
      const vaginal = records.filter(r => r.deliveryType === 'vaginal').length;
      const csection = records.filter(r => r.deliveryType === 'c-section').length;
      setDeliveryStats({ vaginal, csection });

      setTotalDeliveries(records.length);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
      return () => {}; // Optional cleanup function
    }, [loadStats])
  );

  const screenWidth = Dimensions.get('window').width;

  const genderData = [
    { name: 'Boys', population: genderStats.boys, color: '#007AFF', legendFontColor: textColor },
    { name: 'Girls', population: genderStats.girls, color: '#FF69B4', legendFontColor: textColor },
    { name: 'Angels', population: genderStats.angels, color: '#FFD700', legendFontColor: textColor },
  ];

  const deliveryData = {
    labels: ['Vaginal', 'C-Section'],
    datasets: [{
      data: [deliveryStats.vaginal, deliveryStats.csection]
    }]
  };

  const chartConfig = {
    backgroundGradientFrom: backgroundColor,
    backgroundGradientTo: backgroundColor,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Statistics',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ScrollView>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Your Delivery Overview</ThemedText>
          </ThemedView>

          <ThemedView style={styles.statsGrid}>
            <StatCard
              icon="people"
              label="Total Deliveries"
              value={totalDeliveries}
              iconColor={tintColor}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Gender Distribution</ThemedText>
            <ThemedView style={styles.chartContainer}>
              <PieChart
                data={genderData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Delivery Types</ThemedText>
            <ThemedView style={styles.chartContainer}>
              <BarChart
                data={deliveryData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                verticalLabelRotation={0}
                showValuesOnTopOfBars
                fromZero
                yAxisLabel=""
                yAxisSuffix=""
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.statsGrid}>
            <StatCard
              icon="male"
              label="Boys"
              value={genderStats.boys}
              iconColor="#007AFF"
            />
            <StatCard
              icon="female"
              label="Girls"
              value={genderStats.girls}
              iconColor="#FF2D55"
            />
            <StatCard
              icon="star"
              label="Angels"
              value={genderStats.angels}
              iconColor="#FFD700"
            />
          </ThemedView>

          <ThemedView style={styles.statsGrid}>
            <StatCard
              icon="medical"
              label="Vaginal"
              value={deliveryStats.vaginal}
              iconColor={tintColor}
            />
            <StatCard
              icon="cut"
              label="C-Section"
              value={deliveryStats.csection}
              iconColor={tintColor}
            />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  section: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
  },
});
