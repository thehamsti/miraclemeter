import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useToastContext, ToastType } from '@/contexts/ToastContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastItemProps {
  id: string;
  message: string;
  type: ToastType;
  onHide: (id: string) => void;
}

function ToastItem({ id, message, type, onHide }: ToastItemProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const primaryColor = useThemeColor({}, 'primary');

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return successColor;
      case 'error':
        return errorColor;
      case 'info':
      default:
        return primaryColor;
    }
  };

  const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide(id));
  };

  const typeColor = getTypeColor();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: surfaceColor,
          borderLeftColor: typeColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: typeColor + '15' }]}>
        <Ionicons name={getTypeIcon()} size={24} color={typeColor} />
      </View>
      <ThemedText style={[styles.message, { color: textColor }]} numberOfLines={2}>
        {message}
      </ThemedText>
      <Pressable
        onPress={handleHide}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Dismiss notification"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={20} color={textColor} />
      </Pressable>
    </Animated.View>
  );
}

export function ToastContainer() {
  const { toasts, hideToast } = useToastContext();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + Spacing.md }]} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 9999,
    gap: Spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    gap: Spacing.md,
    ...Platform.select({
      ios: {
        ...Shadows.lg,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.lineHeights.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
});
