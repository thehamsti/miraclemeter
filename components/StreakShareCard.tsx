import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, Typography } from '@/constants/Colors';

interface StreakShareCardProps {
  streakWeeks: number;
  shieldCount?: number;
}

function getMilestoneLabel(weeks: number): string {
  if (weeks >= 156) return '3 Years';
  if (weeks >= 104) return '2 Years';
  if (weeks >= 52) return '1 Year';
  if (weeks >= 26) return '6 Months';
  if (weeks >= 12) return '3 Months';
  if (weeks >= 4) return '1 Month';
  return `${weeks} Week${weeks === 1 ? '' : 's'}`;
}

function getGradient(weeks: number): [string, string] {
  if (weeks >= 52) return ['#FFD700', '#FF8C00']; // Gold
  if (weeks >= 26) return ['#00BCD4', '#0097A7']; // Cyan
  if (weeks >= 12) return ['#9C27B0', '#7B1FA2']; // Purple
  if (weeks >= 4) return ['#FF6B35', '#F7931E']; // Orange
  return ['#FF6B6B', '#FF8E53']; // Coral
}

function getIcon(weeks: number): keyof typeof MaterialCommunityIcons.glyphMap {
  if (weeks >= 52) return 'trophy';
  if (weeks >= 26) return 'medal';
  if (weeks >= 12) return 'star-circle';
  return 'fire';
}

export const StreakShareCard = forwardRef<View, StreakShareCardProps>(
  ({ streakWeeks, shieldCount = 0 }, ref) => {
    const gradient = getGradient(streakWeeks);
    const icon = getIcon(streakWeeks);
    const milestoneLabel = getMilestoneLabel(streakWeeks);

    return (
      <View ref={ref} style={styles.container} collapsable={false}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Decorative flames */}
          <View style={styles.decorTopLeft}>
            <MaterialCommunityIcons name="fire" size={40} color="rgba(255,255,255,0.12)" />
          </View>
          <View style={styles.decorTopRight}>
            <MaterialCommunityIcons name="fire" size={32} color="rgba(255,255,255,0.1)" />
          </View>
          <View style={styles.decorBottomLeft}>
            <MaterialCommunityIcons name="fire" size={28} color="rgba(255,255,255,0.08)" />
          </View>
          <View style={styles.decorBottomRight}>
            <MaterialCommunityIcons name="fire" size={36} color="rgba(255,255,255,0.1)" />
          </View>

          {/* Main content */}
          <View style={styles.content}>
            {/* Badge */}
            <View style={styles.headerBadge}>
              <MaterialCommunityIcons name="fire" size={18} color="white" />
              <ThemedText style={styles.headerBadgeText}>STREAK</ThemedText>
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={icon}
                size={56}
                color="white"
              />
            </View>

            {/* Streak count */}
            <ThemedText style={styles.count}>
              {streakWeeks}
            </ThemedText>

            {/* Label */}
            <ThemedText style={styles.label}>
              {streakWeeks === 1 ? 'week' : 'weeks'} strong
            </ThemedText>

            {/* Milestone badge */}
            {streakWeeks >= 4 && (
              <View style={styles.milestoneBadge}>
                <ThemedText style={styles.milestoneText}>
                  {milestoneLabel} Milestone
                </ThemedText>
              </View>
            )}

            {/* Shields */}
            {shieldCount > 0 && (
              <View style={styles.shieldsRow}>
                {[0, 1, 2].map((i) => (
                  <MaterialCommunityIcons
                    key={i}
                    name="shield"
                    size={20}
                    color={i < shieldCount ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'}
                  />
                ))}
              </View>
            )}
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

StreakShareCard.displayName = 'StreakShareCard';

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
    transform: [{ rotate: '-15deg' }],
  },
  decorTopRight: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
    transform: [{ rotate: '15deg' }],
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.xl,
    transform: [{ rotate: '-10deg' }],
  },
  decorBottomRight: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.lg,
    transform: [{ rotate: '10deg' }],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  headerBadgeText: {
    color: 'white',
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  count: {
    fontSize: 80,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    lineHeight: 88,
  },
  label: {
    fontSize: Typography.xl,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  milestoneBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  milestoneText: {
    color: 'white',
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  shieldsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md,
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
