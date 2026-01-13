import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, Typography } from '@/constants/Colors';

type StatsPeriod = 'week' | 'month' | 'year' | 'lifetime';

interface StatsShareCardProps {
  count: number;
  period: StatsPeriod;
}

const PERIOD_CONFIG: Record<StatsPeriod, {
  gradient: [string, string];
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = {
  week: {
    gradient: ['#3B82F6', '#60A5FA'],
    label: 'this week',
    icon: 'calendar-week',
  },
  month: {
    gradient: ['#8B5CF6', '#A78BFA'],
    label: 'this month',
    icon: 'calendar-month',
  },
  year: {
    gradient: ['#10B981', '#34D399'],
    label: 'this year',
    icon: 'calendar-star',
  },
  lifetime: {
    gradient: ['#F59E0B', '#FBBF24'],
    label: 'lifetime',
    icon: 'infinity',
  },
};

export const StatsShareCard = forwardRef<View, StatsShareCardProps>(
  ({ count, period }, ref) => {
    const config = PERIOD_CONFIG[period];
    const babyWord = count === 1 ? 'baby' : 'babies';

    return (
      <View ref={ref} style={styles.container} collapsable={false}>
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Decorative elements */}
          <View style={styles.decorTopLeft}>
            <MaterialCommunityIcons name="star-four-points" size={32} color="rgba(255,255,255,0.15)" />
          </View>
          <View style={styles.decorTopRight}>
            <MaterialCommunityIcons name="baby-carriage" size={28} color="rgba(255,255,255,0.12)" />
          </View>
          <View style={styles.decorBottomLeft}>
            <MaterialCommunityIcons name="heart" size={24} color="rgba(255,255,255,0.1)" />
          </View>
          <View style={styles.decorBottomRight}>
            <MaterialCommunityIcons name="star-shooting" size={26} color="rgba(255,255,255,0.12)" />
          </View>

          {/* Main content */}
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={config.icon}
                size={48}
                color="white"
              />
            </View>

            {/* Count */}
            <ThemedText style={styles.count}>
              {count}
            </ThemedText>

            {/* Label */}
            <ThemedText style={styles.label}>
              {babyWord} {config.label}
            </ThemedText>

            {/* Subtitle */}
            <ThemedText style={styles.subtitle}>
              welcomed into the world
            </ThemedText>
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

StatsShareCard.displayName = 'StatsShareCard';

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
  decorTopLeft: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    opacity: 0.6,
  },
  decorTopRight: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
    opacity: 0.5,
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: 90,
    left: Spacing.xl,
    opacity: 0.5,
  },
  decorBottomRight: {
    position: 'absolute',
    bottom: 80,
    right: Spacing.lg,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  count: {
    fontSize: 72,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    lineHeight: 80,
  },
  label: {
    fontSize: Typography.xl,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: Spacing.sm,
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
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
});

export type { StatsPeriod };
