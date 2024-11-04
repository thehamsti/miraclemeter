import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getBirthRecords } from '@/services/storage';
import { BirthRecord } from '@/types';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StatCard } from '@/components/StatCard';
import { RecordCard } from '@/components/RecordCard';

export default function HomeScreen() {
  const [recentRecords, setRecentRecords] = useState<BirthRecord[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [boysCount, setBoysCount] = useState(0);
  const [girlsCount, setGirlsCount] = useState(0);
  const [angelsCount, setAngelsCount] = useState(0);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        try {
          const records = await getBirthRecords();
          
          // Get recent records (last 5)
          const recent = records.slice(-5).reverse();
          setRecentRecords(recent);

          // Calculate today's count
          const today = new Date();
          const todayRecords = records.filter(record => {
            const recordDate = new Date(record.timestamp);
            return recordDate.toDateString() === today.toDateString();
          });
          setTodayCount(todayRecords.length);

          // Calculate this week's count
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weekRecords = records.filter(record => {
            const recordDate = new Date(record.timestamp);
            return recordDate >= weekAgo;
          });
          setWeekCount(weekRecords.length);

          // Calculate gender counts
          let boys = 0, girls = 0, angels = 0;
          records.forEach(record => {
            record.babies.forEach(baby => {
              if (baby.gender === 'boy') boys++;
              if (baby.gender === 'girl') girls++;
              if (baby.gender === 'angel') angels++;
            });
          });
          setBoysCount(boys);
          setGirlsCount(girls);
          setAngelsCount(angels);

        } catch (error) {
          console.error('Error loading stats:', error);
        }
      };

      loadStats();
    }, []) // Empty dependency array since we want to reload on every focus
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleContainer}>
            <Ionicons name="heart" size={32} color="#FF69B4" />
            <ThemedText type="title">Birth Tracker</ThemedText>
          </ThemedView>
          <ThemedText type="subtitle">Welcome Back! 🌟</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <StatCard
            icon="today"
            iconColor={tintColor}
            label="Today"
            value={todayCount}
            subtitle="Deliveries"
          />
          <StatCard
            icon="calendar"
            iconColor={tintColor}
            label="This Week"
            value={weekCount}
            subtitle="Deliveries"
          />
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <StatCard
            icon="male"
            iconColor={tintColor}
            label="Boys"
            value={boysCount}
          />
          <StatCard
            icon="female"
            iconColor="#FF69B4"
            label="Girls"
            value={girlsCount}
          />
          <StatCard
            icon="star"
            iconColor="#FFD700"
            label="Angels"
            value={angelsCount}
          />
        </ThemedView>

        <ThemedView style={styles.quickActions}>
          <Link href="/quick-entry" asChild>
            <Button 
              title="New Birth Record"
              size="large"
              style={styles.mainButton}
              icon={<Ionicons name="add-circle" size={24} color="white" />}
              onPress={() => {
                console.log('New Birth Record');
              }}
            />
          </Link>
        </ThemedView>

        <ThemedView style={styles.recentSection}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color={tintColor} />
            <ThemedText type="subtitle">Recent Entries</ThemedText>
          </ThemedView>
          {recentRecords.length > 0 ? (
            recentRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          ) : (
            <RecordCard 
              placeholder="No birth records yet. Add your first record using the button above! 🎉"
            />
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  quickActions: {
    padding: 20,
    gap: 16,
  },
  mainButton: {
    minHeight: 60,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
  },
  recentSection: {
    padding: 20,
    gap: 12,
    paddingBottom: 100,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
