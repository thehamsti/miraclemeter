import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, Typography } from '@/constants/Colors';
import type { Achievement } from '@/types';

interface AchievementShareCardProps {
  achievement: Achievement;
  unlockedAt?: Date;
}

const CATEGORY_GRADIENTS: Record<Achievement['category'], [string, string]> = {
  milestone: ['#643872', '#9B7EBD'], // Purple gradient (app brand)
  special: ['#F59E0B', '#FCD34D'],   // Gold/amber gradient
  skill: ['#10B981', '#6EE7B7'],     // Green gradient
  streak: ['#EF4444', '#FCA5A5'],    // Red gradient
};

export const AchievementShareCard = forwardRef<View, AchievementShareCardProps>(
  ({ achievement, unlockedAt }, ref) => {
    const gradient = CATEGORY_GRADIENTS[achievement.category] || CATEGORY_GRADIENTS.milestone;
    
    const formattedDate = unlockedAt 
      ? unlockedAt.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })
      : 'Recently';

    return (
      <View ref={ref} style={styles.container} collapsable={false}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Decorative elements */}
          <View style={styles.decorTop}>
            <MaterialCommunityIcons name="star-four-points" size={24} color="rgba(255,255,255,0.2)" />
          </View>
          <View style={styles.decorBottom}>
            <MaterialCommunityIcons name="star-shooting" size={20} color="rgba(255,255,255,0.15)" />
          </View>

          {/* Main content */}
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={achievement.icon as any}
                size={64}
                color="white"
              />
            </View>

            {/* Achievement name */}
            <ThemedText style={styles.name} numberOfLines={2}>
              {achievement.name}
            </ThemedText>

            {/* Description */}
            <ThemedText style={styles.description} numberOfLines={2}>
              {achievement.description}
            </ThemedText>

            {/* Unlocked date */}
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons name="calendar-check" size={16} color="rgba(255,255,255,0.8)" />
              <ThemedText style={styles.date}>
                Unlocked {formattedDate}
              </ThemedText>
            </View>
          </View>

          {/* Branding footer */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <View style={styles.brandingContainer}>
              <MaterialCommunityIcons name="baby-face-outline" size={18} color="rgba(255,255,255,0.7)" />
              <ThemedText style={styles.branding}>MiracleMeter</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

AchievementShareCard.displayName = 'AchievementShareCard';

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 400,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: Spacing.xl,
  },
  decorTop: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    opacity: 0.6,
  },
  decorBottom: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.lg,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  name: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: Typography.lineHeights.base,
    paddingHorizontal: Spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  date: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    alignItems: 'center',
  },
  footerDivider: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
    marginBottom: Spacing.md,
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  branding: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: Typography.letterSpacing.wide,
  },
});
