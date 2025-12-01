import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Modal,
  Pressable,
  View,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ThemedText } from './ThemedText';
import { useThemeColor, useShadowOpacity } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';

interface MenuProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MenuItemData {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  href: '/stats' | '/settings' | '/about' | '/feedback';
  accentColor: 'primary' | 'success' | 'warning' | 'info';
}

const menuItems: MenuItemData[] = [
  {
    icon: 'analytics-outline',
    label: 'Statistics',
    description: 'View detailed insights',
    href: '/stats',
    accentColor: 'primary',
  },
  {
    icon: 'settings-outline',
    label: 'Settings',
    description: 'Customize your experience',
    href: '/settings',
    accentColor: 'info',
  },
  {
    icon: 'information-circle-outline',
    label: 'About',
    description: 'Learn more about the app',
    href: '/about',
    accentColor: 'success',
  },
  {
    icon: 'chatbox-outline',
    label: 'Feedback',
    description: 'Share your thoughts',
    href: '/feedback',
    accentColor: 'warning',
  },
];

const MENU_WIDTH = 280;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Menu({ isVisible, onClose }: MenuProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const infoColor = useThemeColor({}, 'info');
  const borderColor = useThemeColor({}, 'border');
  const borderLightColor = useThemeColor({}, 'borderLight');
  const shadowColor = useThemeColor({}, 'shadowColor');
  const shadowOpacity = useShadowOpacity();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const itemAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

  const getAccentColor = (accent: string): string => {
    switch (accent) {
      case 'primary':
        return primaryColor;
      case 'success':
        return successColor;
      case 'warning':
        return warningColor;
      case 'info':
        return infoColor;
      default:
        return primaryColor;
    }
  };

  useEffect(() => {
    if (isVisible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(-20);
      scaleAnim.setValue(0.95);
      for (const anim of itemAnims) {
        anim.setValue(0);
      }

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const staggerDelay = 50;
      for (const [index, anim] of itemAnims.entries()) {
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          delay: 100 + index * staggerDelay,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [isVisible, fadeAnim, slideAnim, scaleAnim, itemAnims]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const renderMenuItem = (item: MenuItemData, index: number) => {
    const accentColor = getAccentColor(item.accentColor);
    const iconBgColor = hexToRgba(accentColor, 0.12);
    const itemAnim = itemAnims[index];

    return (
      <Animated.View
        key={item.label}
        style={{
          opacity: itemAnim,
          transform: [
            {
              translateX: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <Link href={item.href} asChild onPress={handleClose}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItemPressable,
              pressed && { backgroundColor: borderLightColor },
            ]}
          >
            <View style={styles.menuItemRow}>
              <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                <Ionicons name={item.icon} size={22} color={accentColor} />
              </View>
              <View style={styles.menuItemContent}>
                <ThemedText style={[styles.menuItemLabel, { color: textColor }]}>
                  {item.label}
                </ThemedText>
                <ThemedText
                  style={[styles.menuItemDescription, { color: textSecondaryColor }]}
                  numberOfLines={1}
                >
                  {item.description}
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={textSecondaryColor}
                style={styles.chevron}
              />
            </View>
          </Pressable>
        </Link>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={styles.backdropPressable} onPress={handleClose}>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={isDark ? 40 : 30}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' },
                ]}
              />
            )}
          </Pressable>
        </Animated.View>

        {/* Menu Container */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              backgroundColor: surfaceColor,
              shadowColor,
              shadowOpacity: shadowOpacity * 1.5,
              borderColor: isDark ? borderColor : 'transparent',
              top: insets.top + 60,
              right: Math.min(Spacing.lg, SCREEN_WIDTH - MENU_WIDTH - Spacing.lg),
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Menu Header */}
          <View style={[styles.menuHeader, { borderBottomColor: borderLightColor }]}>
            <View style={styles.menuHeaderRow}>
              <View
                style={[
                  styles.menuHeaderIcon,
                  { backgroundColor: hexToRgba(primaryColor, 0.12) },
                ]}
              >
                <Ionicons name="apps" size={18} color={primaryColor} />
              </View>
              <ThemedText style={[styles.menuHeaderTitle, { color: textColor }]}>
                Menu
              </ThemedText>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: borderLightColor },
                pressed && styles.closeButtonPressed,
              ]}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={16} color={textSecondaryColor} />
            </Pressable>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </View>

          {/* Menu Footer */}
          <View style={[styles.menuFooter, { borderTopColor: borderLightColor }]}>
            <ThemedText style={[styles.footerText, { color: textSecondaryColor }]}>
              Miracle Meter
            </ThemedText>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPressable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    width: MENU_WIDTH,
    borderRadius: BorderRadius.xxl,
    borderWidth: Platform.OS === 'android' ? 0 : 0.5,
    ...Platform.select({
      ios: {
        ...Shadows.xl,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md + 4,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  menuHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  menuHeaderTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.wide,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  menuItems: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  menuItemPressable: {
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.lg,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: Typography.xs,
    lineHeight: Typography.lineHeights.xs,
  },
  chevron: {
    opacity: 0.4,
    marginLeft: Spacing.sm,
  },
  menuFooter: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
    letterSpacing: Typography.letterSpacing.wide,
  },
});
