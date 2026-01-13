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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, BorderRadius, Typography } from '@/constants/Colors';

interface MenuProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MenuItemData {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  href: '/stats' | '/settings' | '/about' | '/feedback';
  color: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function Menu({ isVisible, onClose }: MenuProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'borderLight');

  const menuItems: MenuItemData[] = [
    {
      icon: 'stats-chart',
      label: 'Statistics',
      description: 'View detailed insights',
      href: '/stats',
      color: primaryColor,
    },
    {
      icon: 'settings',
      label: 'Settings',
      description: 'Customize your experience',
      href: '/settings',
      color: '#8B5CF6',
    },
    {
      icon: 'information-circle',
      label: 'About',
      description: 'Learn more about the app',
      href: '/about',
      color: '#10B981',
    },
    {
      icon: 'chatbubble-ellipses',
      label: 'Feedback',
      description: 'Share your thoughts',
      href: '/feedback',
      color: '#F59E0B',
    },
  ];

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const itemAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isVisible) {
      // Reset animations
      backdropOpacity.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
      for (const anim of itemAnims) {
        anim.setValue(0);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger menu items
      const staggerDelay = 60;
      for (const [index, anim] of itemAnims.entries()) {
        Animated.spring(anim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          delay: 150 + index * staggerDelay,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [isVisible, backdropOpacity, slideAnim, itemAnims]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleItemPress = (href: MenuItemData['href']) => {
    handleClose();
    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  const handleLicensesPress = () => {
    handleClose();
    setTimeout(() => {
      router.push('/licenses');
    }, 200);
  };

  const renderMenuItem = (item: MenuItemData, index: number) => {
    const itemAnim = itemAnims[index];

    return (
      <Animated.View
        key={item.label}
        style={{
          opacity: itemAnim,
          transform: [
            {
              translateY: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        }}
      >
        <Pressable
          onPress={() => handleItemPress(item.href)}
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: surfaceColor },
            pressed && styles.menuItemPressed,
          ]}
        >
          <View style={[styles.menuItemIcon, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.menuItemContent}>
            <ThemedText style={[styles.menuItemLabel, { color: textColor }]}>
              {item.label}
            </ThemedText>
            <ThemedText style={[styles.menuItemDescription, { color: textSecondaryColor }]}>
              {item.description}
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
        </Pressable>
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
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor,
              paddingBottom: insets.bottom + Spacing.lg,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: borderColor }]} />
          </View>

          {/* Header */}
          <LinearGradient
            colors={[primaryColor, primaryColor + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View>
                <ThemedText style={styles.headerTitle}>Menu</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Miracle Meter</ThemedText>
              </View>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
            </View>
          </LinearGradient>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: textSecondaryColor }]}>
              Made with love for healthcare heroes
            </ThemedText>
            <Pressable onPress={handleLicensesPress} style={styles.licensesLink}>
              <ThemedText style={[styles.licensesText, { color: textSecondaryColor }]}>
                Open Source Licenses
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    borderTopLeftRadius: BorderRadius.xxl + 8,
    borderTopRightRadius: BorderRadius.xxl + 8,
    minHeight: SCREEN_HEIGHT * 0.6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 0.95 }],
  },
  menuItems: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  menuItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: Typography.sm,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  footerText: {
    fontSize: Typography.xs,
    textAlign: 'center',
  },
  licensesLink: {
    paddingVertical: Spacing.xs,
  },
  licensesText: {
    fontSize: Typography.xs,
    textDecorationLine: 'underline',
  },
});
