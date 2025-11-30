import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BorderRadius, Spacing, Shadows } from '@/constants/Colors';

interface SkeletonCardProps {
  variant?: 'record' | 'stat' | 'simple';
}

export function SkeletonCard({ variant = 'record' }: SkeletonCardProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'borderLight');
  const shimmerOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerOpacity]);

  const SkeletonLine = ({ width, height = 12, style }: { width: number | string; height?: number; style?: object }) => (
    <Animated.View
      style={[
        styles.skeletonLine,
        { width, height, backgroundColor: borderColor, opacity: shimmerOpacity },
        style,
      ]}
    />
  );

  if (variant === 'stat') {
    return (
      <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
        <SkeletonLine width={44} height={44} style={styles.iconPlaceholder} />
        <SkeletonLine width={40} height={24} style={styles.statValue} />
        <SkeletonLine width={60} height={12} />
      </View>
    );
  }

  if (variant === 'simple') {
    return (
      <View style={[styles.simpleCard, { backgroundColor: surfaceColor }]}>
        <SkeletonLine width="70%" height={16} />
        <SkeletonLine width="50%" height={12} style={{ marginTop: Spacing.sm }} />
      </View>
    );
  }

  // Default: record card variant
  return (
    <View style={[styles.card, { backgroundColor: surfaceColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <SkeletonLine width={40} height={40} style={styles.iconPlaceholder} />
          <View style={styles.dateText}>
            <SkeletonLine width={120} height={14} />
            <SkeletonLine width={80} height={10} style={{ marginTop: Spacing.xs }} />
          </View>
        </View>
        <SkeletonLine width={32} height={32} style={styles.iconPlaceholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <SkeletonLine width={80} height={28} style={styles.chip} />
          <SkeletonLine width={70} height={28} style={styles.chip} />
          <SkeletonLine width={90} height={28} style={styles.chip} />
        </View>

        <View style={styles.babiesRow}>
          <SkeletonLine width={72} height={24} style={styles.babyChip} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  dateText: {
    flex: 1,
  },
  content: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  babiesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  skeletonLine: {
    borderRadius: BorderRadius.sm,
  },
  iconPlaceholder: {
    borderRadius: BorderRadius.lg,
  },
  chip: {
    borderRadius: BorderRadius.md,
  },
  babyChip: {
    borderRadius: BorderRadius.full,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.xs,
    minHeight: 100,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statValue: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  simpleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Platform.select({
      ios: {
        ...Shadows.sm,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
