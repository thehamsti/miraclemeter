import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getBirthRecords } from '@/services/storage';
import type { BirthRecord, YearlyBabyCount } from '@/types';

interface GenderCounts {
  boys: number;
  girls: number;
  angels: number;
}

interface DeliveryCounts {
  vaginal: number;
  cSection: number;
  unknown: number;
}

interface Statistics {
  records: BirthRecord[];
  recentRecords: BirthRecord[];
  totalDeliveries: number;
  totalBabies: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  genderCounts: GenderCounts;
  deliveryCounts: DeliveryCounts;
  yearlyBabyCounts: YearlyBabyCount[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useStatistics(): Statistics {
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [genderCounts, setGenderCounts] = useState<GenderCounts>({ boys: 0, girls: 0, angels: 0 });
  const [deliveryCounts, setDeliveryCounts] = useState<DeliveryCounts>({ vaginal: 0, cSection: 0, unknown: 0 });
  const [yearlyBabyCounts, setYearlyBabyCounts] = useState<YearlyBabyCount[]>([]);

  const calculateStats = useCallback((birthRecords: BirthRecord[]) => {
    const now = new Date();

    // Calculate period-based counts
    let today = 0;
    let week = 0;
    let month = 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    for (const record of birthRecords) {
      if (!record.timestamp) continue;

      const recordDate = new Date(record.timestamp);

      if (recordDate.toDateString() === now.toDateString()) {
        today++;
      }
      if (recordDate >= weekAgo) {
        week++;
      }
      if (recordDate >= monthAgo) {
        month++;
      }
    }

    setTodayCount(today);
    setWeekCount(week);
    setMonthCount(month);

    // Calculate gender counts
    let boys = 0;
    let girls = 0;
    let angels = 0;

    for (const record of birthRecords) {
      if (!record.babies || !Array.isArray(record.babies)) continue;

      for (const baby of record.babies) {
        if (baby.gender === 'boy') boys++;
        else if (baby.gender === 'girl') girls++;
        else if (baby.gender === 'angel') angels++;
      }
    }

    setGenderCounts({ boys, girls, angels });

    const yearlyDataMap: Record<number, YearlyBabyCount> = {};

    for (const record of birthRecords) {
      if (!record.timestamp) continue;

      const year = new Date(record.timestamp).getFullYear();

      if (!yearlyDataMap[year]) {
        yearlyDataMap[year] = {
          year,
          babies: 0,
          genders: { boys: 0, girls: 0, angels: 0 },
          deliveries: { vaginal: 0, cSection: 0, unknown: 0, total: 0 },
        };
      }

      const entry = yearlyDataMap[year];
      entry.deliveries.total++;

      if (record.deliveryType === 'vaginal') {
        entry.deliveries.vaginal++;
      } else if (record.deliveryType === 'c-section') {
        entry.deliveries.cSection++;
      } else {
        entry.deliveries.unknown++;
      }

      if (record.babies && Array.isArray(record.babies)) {
        entry.babies += record.babies.length;
        for (const baby of record.babies) {
          if (baby.gender === 'boy') entry.genders.boys++;
          else if (baby.gender === 'girl') entry.genders.girls++;
          else if (baby.gender === 'angel') entry.genders.angels++;
        }
      }
    }

    const yearlyCounts = Object.values(yearlyDataMap).sort((a, b) => b.year - a.year);

    setYearlyBabyCounts(yearlyCounts);

    // Calculate delivery type counts
    let vaginal = 0;
    let cSection = 0;
    let unknown = 0;

    for (const record of birthRecords) {
      if (record.deliveryType === 'vaginal') {
        vaginal++;
      } else if (record.deliveryType === 'c-section') {
        cSection++;
      } else {
        unknown++;
      }
    }

    setDeliveryCounts({ vaginal, cSection, unknown });
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const birthRecords = await getBirthRecords();
      setRecords(birthRecords);
      calculateStats(birthRecords);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const totalBabies = genderCounts.boys + genderCounts.girls + genderCounts.angels;

  // Get recent records (last 5, sorted newest first)
  const recentRecords = [...records]
    .sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return {
    records,
    recentRecords,
    totalDeliveries: records.length,
    totalBabies,
    todayCount,
    weekCount,
    monthCount,
    genderCounts,
    deliveryCounts,
    yearlyBabyCounts,
    loading,
    refresh: loadStats,
  };
}
