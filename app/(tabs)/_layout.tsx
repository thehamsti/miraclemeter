import { Tabs, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Platform, View } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useThemeColor, useShadowOpacity } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Menu } from '@/components/Menu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';

export default function TabLayout() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'border');
  const shadowColor = useThemeColor({}, 'shadowColor');
  const shadowOpacity = useShadowOpacity();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const showMenu = !pathname.includes('quick-entry');

  const MenuButton = () => (
    <Pressable 
      onPress={() => setIsMenuVisible(true)}
      style={({ pressed }) => [
        styles.menuButton,
        { 
          top: insets.top + 8,
          backgroundColor: surfaceColor,
          shadowColor,
          shadowOpacity: pressed ? shadowOpacity * 0.5 : shadowOpacity,
        },
        pressed && styles.menuButtonPressed
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="menu" size={24} color={textColor} />
    </Pressable>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tintColor,
          tabBarInactiveTintColor: tabIconDefault,
          tabBarStyle: [
            styles.tabBar,
            { 
              backgroundColor: surfaceColor,
              borderTopColor: borderColor,
              shadowColor,
              shadowOpacity,
            }
          ],
          headerShown: false,
          tabBarLabelStyle: [
            styles.tabBarLabel,
            { color: textSecondaryColor }
          ],
          tabBarIconStyle: styles.tabBarIcon,
          tabBarItemStyle: styles.tabBarItem,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="quick-entry/index"
          options={{
            title: 'Quick Entry',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'add-circle' : 'add-circle-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history/index"
          options={{
            title: 'History',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color} />
            ),
          }}
        />
      </Tabs>
      {showMenu && (
        <>
          <MenuButton />
          <Menu 
            isVisible={isMenuVisible} 
            onClose={() => setIsMenuVisible(false)} 
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    paddingTop: Spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    height: Platform.OS === 'ios' ? 88 : 72,
    borderTopWidth: 0.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarItem: {
    paddingTop: Spacing.xs,
  },
  tabBarIcon: {
    marginBottom: -Spacing.xs,
  },
  tabBarLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  menuButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  menuButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
