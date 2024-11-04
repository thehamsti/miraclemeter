import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getBirthRecords } from '@/services/storage';
import { BirthRecord } from '@/types';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [recentRecords, setRecentRecords] = useState<BirthRecord[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);

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
        } catch (error) {
          console.error('Error loading stats:', error);
        }
      };

      loadStats();
    }, []) // Empty dependency array since we want to reload on every focus
  );

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.titleContainer}>
          <Ionicons name="heart" size={32} color="#FF69B4" />
          <ThemedText type="title">Birth Tracker</ThemedText>
        </ThemedView>
        <ThemedText type="subtitle">Welcome Back! 🌟</ThemedText>
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <Ionicons name="today" size={24} color="#4A90E2" />
          <ThemedText type="defaultSemiBold">Today</ThemedText>
          <ThemedText type="title">{todayCount}</ThemedText>
          <ThemedText>Deliveries</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#4A90E2" />
          <ThemedText type="defaultSemiBold">This Week</ThemedText>
          <ThemedText type="title">{weekCount}</ThemedText>
          <ThemedText>Deliveries</ThemedText>
        </ThemedView>
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
          <Ionicons name="list" size={24} color="#4A90E2" />
          <ThemedText type="subtitle">Recent Entries</ThemedText>
        </ThemedView>
        {recentRecords.length > 0 ? (
          recentRecords.map((record) => (
            <ThemedView key={record.id} style={styles.recentCard}>
              <ThemedText type="defaultSemiBold">
                <Ionicons name="calendar" size={16} /> {new Date(record.timestamp).toLocaleDateString()}
              </ThemedText>
              <ThemedText>
                <Ionicons name="people" size={16} /> {record.babies.length > 1 ? 'Multiple Birth' : 'Single Birth'}
              </ThemedText>
              <ThemedText>
                <Ionicons name="medical" size={16} /> {record.deliveryType}
              </ThemedText>
            </ThemedView>
          ))
        ) : (
          <ThemedView style={styles.recentCard}>
            <ThemedText style={styles.placeholderText}>
              No birth records yet. Add your first record using the button above! 🎉
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    gap: 4,
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
  recentCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    gap: 4,
  },
  placeholderText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
