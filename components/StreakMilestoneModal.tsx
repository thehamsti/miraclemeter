import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 50;

interface StreakMilestoneModalProps {
  visible: boolean;
  milestone: number;
  onDismiss: () => void;
  onShare?: () => void;
}

// Confetti piece component
function ConfettiPiece({ delay, startX }: { delay: number; startX: number }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 8 + Math.random() * 8;
  const isCircle = Math.random() > 0.5;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 200;
    const duration = 2500 + Math.random() * 1500;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + 100,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: drift,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 360 * (2 + Math.random() * 3),
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          delay: duration * 0.7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: startX,
          width: size,
          height: isCircle ? size : size * 1.5,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotateInterpolate },
          ],
          opacity,
        },
      ]}
    />
  );
}

// Get milestone info
function getMilestoneInfo(weeks: number): {
  title: string;
  subtitle: string;
  icon: string;
  colors: [string, string];
} {
  if (weeks >= 156) {
    return {
      title: '3 YEARS!',
      subtitle: 'Legendary dedication',
      icon: 'crown',
      colors: ['#FFD700', '#FF8C00'],
    };
  }
  if (weeks >= 104) {
    return {
      title: '2 YEARS!',
      subtitle: 'Incredible commitment',
      icon: 'diamond-stone',
      colors: ['#E040FB', '#7C4DFF'],
    };
  }
  if (weeks >= 52) {
    return {
      title: '1 YEAR!',
      subtitle: "You're unstoppable",
      icon: 'trophy',
      colors: ['#FFD700', '#FFA000'],
    };
  }
  if (weeks >= 26) {
    return {
      title: '6 MONTHS!',
      subtitle: 'Half a year strong',
      icon: 'medal',
      colors: ['#00BCD4', '#0097A7'],
    };
  }
  if (weeks >= 12) {
    return {
      title: '3 MONTHS!',
      subtitle: 'Consistency champion',
      icon: 'star-circle',
      colors: ['#9C27B0', '#7B1FA2'],
    };
  }
  // 4 weeks
  return {
    title: '1 MONTH!',
    subtitle: "You're on fire",
    icon: 'fire',
    colors: ['#FF6B35', '#F7931E'],
  };
}

export function StreakMilestoneModal({
  visible,
  milestone,
  onDismiss,
  onShare,
}: StreakMilestoneModalProps) {
  const surfaceColor = useThemeColor({}, 'surface');

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const [showConfetti, setShowConfetti] = useState(false);
  const milestoneInfo = getMilestoneInfo(milestone);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);

      // Animate modal entrance
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(badgeScale, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(glowOpacity, {
                toValue: 0.3,
                duration: 1000,
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      badgeScale.setValue(0);
      glowOpacity.setValue(0);
      setShowConfetti(false);
    }
  }, [visible]);

  const confettiPieces = Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
    id: i,
    delay: Math.random() * 500,
    startX: Math.random() * SCREEN_WIDTH,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        {/* Confetti layer */}
        {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            {confettiPieces.map((piece) => (
              <ConfettiPiece
                key={piece.id}
                delay={piece.delay}
                startX={piece.startX}
              />
            ))}
          </View>
        )}

        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onDismiss}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>

        {/* Modal content */}
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={milestoneInfo.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  opacity: glowOpacity,
                  borderColor: 'rgba(255,255,255,0.5)',
                },
              ]}
            />

            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons name="fire" size={24} color="white" />
              <ThemedText style={styles.headerText}>STREAK MILESTONE</ThemedText>
            </View>

            {/* Main badge */}
            <Animated.View
              style={[
                styles.badgeContainer,
                { transform: [{ scale: badgeScale }] },
              ]}
            >
              <View style={styles.badge}>
                <MaterialCommunityIcons
                  name={milestoneInfo.icon as any}
                  size={64}
                  color={milestoneInfo.colors[0]}
                />
              </View>
            </Animated.View>

            {/* Title */}
            <ThemedText style={styles.title}>{milestoneInfo.title}</ThemedText>
            <ThemedText style={styles.subtitle}>{milestoneInfo.subtitle}</ThemedText>

            {/* Week count */}
            <View style={styles.weekBadge}>
              <ThemedText style={styles.weekCount}>{milestone}</ThemedText>
              <ThemedText style={styles.weekLabel}>weeks strong</ThemedText>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {onShare && (
                <Pressable
                  style={styles.shareButton}
                  onPress={onShare}
                >
                  <Ionicons name="share-outline" size={20} color="white" />
                  <ThemedText style={styles.shareButtonText}>Share</ThemedText>
                </Pressable>
              )}
              <Pressable style={styles.continueButton} onPress={onDismiss}>
                <ThemedText style={styles.continueButtonText}>
                  Keep Going!
                </ThemedText>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  confetti: {
    position: 'absolute',
    top: -20,
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 360,
  },
  card: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.lg,
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: BorderRadius.xxl + 4,
    borderWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  headerText: {
    color: 'white',
    fontSize: Typography.sm,
    fontWeight: Typography.weights.bold,
    letterSpacing: 2,
  },
  badgeContainer: {
    marginBottom: Spacing.lg,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  title: {
    color: 'white',
    fontSize: Typography['3xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.lg,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  weekBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  weekCount: {
    color: 'white',
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
  },
  weekLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  shareButtonText: {
    color: 'white',
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  continueButtonText: {
    color: 'white',
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
});
