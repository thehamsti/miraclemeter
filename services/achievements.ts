import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserAchievements, BirthRecord, UserPreferences } from "../types";
import { ACHIEVEMENTS } from "../constants/achievements";

const ACHIEVEMENTS_KEY = "userAchievements";

const defaultAchievements: UserAchievements = {
  unlocked: [],
  progress: {},
  stats: {
    totalDeliveries: 0,
    currentStreak: 0,
    longestStreak: 0,
    deliveryTypes: {
      vaginal: 0,
      cSection: 0,
    },
    multipleBirths: 0,
    angelBabies: 0,
  },
};

export const getAchievements = async (): Promise<UserAchievements> => {
  try {
    const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure progress object exists
      if (!parsed.progress) {
        parsed.progress = {};
      }
      return parsed;
    }

    // Initialize progress for all achievements
    const initialAchievements = { ...defaultAchievements };
    initialAchievements.progress = {};
    ACHIEVEMENTS.forEach((achievement) => {
      initialAchievements.progress[achievement.id] = 0;
    });

    // Save the initialized achievements
    await saveAchievements(initialAchievements);

    return initialAchievements;
  } catch (error) {
    console.error("Error loading achievements:", error);
    return defaultAchievements;
  }
};

export const saveAchievements = async (
  achievements: UserAchievements,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error("Error saving achievements:", error);
  }
};

export const checkAchievements = async (
  records: BirthRecord[],
  preferences: UserPreferences,
): Promise<string[]> => {
  const achievements = await getAchievements();
  const newlyUnlocked: string[] = [];

  // Update stats
  achievements.stats.totalDeliveries = records.length;

  // Calculate delivery types
  achievements.stats.deliveryTypes.vaginal = 0;
  achievements.stats.deliveryTypes.cSection = 0;
  achievements.stats.multipleBirths = 0;
  achievements.stats.angelBabies = 0;

  for (const record of records) {
    if (record.deliveryType === "vaginal") {
      achievements.stats.deliveryTypes.vaginal++;
    } else if (record.deliveryType === "c-section") {
      achievements.stats.deliveryTypes.cSection++;
    }

    if (record.babies.length > 1) {
      achievements.stats.multipleBirths++;
    }

    const angelBabies = record.babies.filter(
      (b) => b.gender === "angel",
    ).length;
    if (angelBabies > 0) {
      achievements.stats.angelBabies += angelBabies;
    }
  }

  // Calculate streak
  const sortedRecords = [...records].sort(
    (a, b) =>
      new Date(b.timestamp || 0).getTime() -
      new Date(a.timestamp || 0).getTime(),
  );

  let currentStreak = 0;
  let lastDate: Date | null = null;

  for (const record of sortedRecords) {
    if (!record.timestamp) continue;

    const recordDate = new Date(record.timestamp);
    recordDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      currentStreak = 1;
      lastDate = recordDate;
    } else {
      const dayDiff = Math.floor(
        (lastDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff === 1) {
        currentStreak++;
        lastDate = recordDate;
      } else if (dayDiff > 1) {
        break;
      }
    }
  }

  achievements.stats.currentStreak = currentStreak;
  achievements.stats.longestStreak = Math.max(
    achievements.stats.longestStreak,
    currentStreak,
  );

  if (sortedRecords.length > 0 && sortedRecords[0].timestamp) {
    achievements.stats.lastDeliveryDate = new Date(sortedRecords[0].timestamp);
  }

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    if (achievements.unlocked.includes(achievement.id)) continue;

    let shouldUnlock = false;
    let progress = 0;

    switch (achievement.requirement.type) {
      case "count":
        progress = achievements.stats.totalDeliveries;
        shouldUnlock = progress >= achievement.requirement.value;
        break;

      case "streak":
        progress = achievements.stats.currentStreak;
        shouldUnlock = progress >= achievement.requirement.value;
        break;

      case "specific":
        switch (achievement.requirement.condition) {
          case "twins":
            progress = records.filter((r) => r.babies.length === 2).length;
            break;
          case "triplets":
            progress = records.filter((r) => r.babies.length === 3).length;
            break;
          case "double_shift":
            // Check for days with 2 deliveries
            const deliveriesByDate = groupDeliveriesByDate(records);
            progress = Object.values(deliveriesByDate).filter(
              (count) => count >= 2,
            ).length;
            break;
          case "triple_shift":
            // Check for days with 3 deliveries
            const deliveriesByDate2 = groupDeliveriesByDate(records);
            progress = Object.values(deliveriesByDate2).filter(
              (count) => count >= 3,
            ).length;
            break;
          case "marathon_shift":
            // Check for days with 4+ deliveries
            const deliveriesByDate3 = groupDeliveriesByDate(records);
            progress = Object.values(deliveriesByDate3).filter(
              (count) => count >= 4,
            ).length;
            break;
          case "weekend":
            progress = records.filter((r) => {
              if (!r.timestamp) return false;
              const day = new Date(r.timestamp).getDay();
              return day === 0 || day === 6; // Sunday or Saturday
            }).length;
            break;
          case "holiday":
            progress = records.filter((r) => {
              if (!r.timestamp) return false;
              return isHoliday(new Date(r.timestamp));
            }).length;
            break;
          case "vaginal":
            progress = achievements.stats.deliveryTypes.vaginal;
            break;
          case "c-section":
            progress = achievements.stats.deliveryTypes.cSection;
            break;
          case "angel":
            progress = achievements.stats.angelBabies;
            break;
          // case "water_birth":
          //   // This would need to be tracked in the birth record
          //   // For now, we'll skip this
          //   progress = 0;
          //   break;
          // case "breech":
          //   // This would need to be tracked in the birth record
          //   progress = 0;
          //   break;
          // case "vbac":
          //   // This would need to be tracked in the birth record
          //   progress = 0;
          //   break;
          case "preterm":
            // This would need to be tracked in the birth record
            progress = 0;
            break;
          case "multiples":
            progress = achievements.stats.multipleBirths;
            break;
          case "boys":
            progress = records.reduce((count, record) => {
              return count + record.babies.filter(b => b.gender === "boy").length;
            }, 0);
            break;
          case "girls":
            progress = records.reduce((count, record) => {
              return count + record.babies.filter(b => b.gender === "girl").length;
            }, 0);
            break;
          // case "first_time_parents":
          //   // This would need to be tracked in the birth record
          //   progress = 0;
          //   break;
        }
        shouldUnlock = progress >= achievement.requirement.value;
        break;
    }

    achievements.progress[achievement.id] = progress;

    if (shouldUnlock) {
      achievements.unlocked.push(achievement.id);
      newlyUnlocked.push(achievement.id);
    }
  }

  await saveAchievements(achievements);
  return newlyUnlocked;
};

export const getAchievementProgress = (
  achievements: UserAchievements,
  achievementId: string,
): number => {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return 0;

  const current = achievements.progress[achievementId] || 0;
  const required = achievement.requirement.value;
  const progress = Math.min(current / required, 1);

  return progress;
};

// Helper function to group deliveries by date
const groupDeliveriesByDate = (
  records: BirthRecord[],
): Record<string, number> => {
  const deliveriesByDate: Record<string, number> = {};

  for (const record of records) {
    if (!record.timestamp) continue;

    const date = new Date(record.timestamp);
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    deliveriesByDate[dateKey] = (deliveriesByDate[dateKey] || 0) + 1;
  }

  return deliveriesByDate;
};

// Helper function to check if a date is a major holiday
const isHoliday = (date: Date): boolean => {
  const month = date.getMonth() + 1; // 0-indexed
  const day = date.getDate();

  // Major US holidays (you can customize based on region)
  const holidays = [
    { month: 1, day: 1 }, // New Year's Day
    { month: 2, day: 14 }, // Valentine's Day
    { month: 3, day: 17 }, // St. Patrick's Day
    { month: 7, day: 4 }, // Independence Day
    { month: 10, day: 31 }, // Halloween
    { month: 11, day: 11 }, // Veterans Day
    { month: 12, day: 25 }, // Christmas
    { month: 12, day: 31 }, // New Year's Eve
  ];

  return holidays.some((h) => h.month === month && h.day === day);
};
