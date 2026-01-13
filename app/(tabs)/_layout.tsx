import { Tabs, useRouter } from 'expo-router';
import React, { useState, createContext, useContext } from 'react';
import { StyleSheet, Platform, Pressable, View } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useThemeColor, useShadowOpacity } from '@/hooks/useThemeColor';
import { Menu } from '@/components/Menu';
import { Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type MenuContextType = {
  openMenu: () => void;
};

const MenuContext = createContext<MenuContextType>({ openMenu: () => {} });

export function useMenu() {
  return useContext(MenuContext);
}

export default function TabLayout() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'border');
  const shadowColor = useThemeColor({}, 'shadowColor');
  const shadowOpacity = useShadowOpacity();
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <MenuContext.Provider value={{ openMenu: () => setIsMenuVisible(true) }}>
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
            },
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
          name="quick-entry-placeholder"
          options={{
            title: 'Quick Entry',
            tabBarButton: () => (
              <View style={styles.addButtonContainer}>
                <Pressable
                  onPress={() => router.push('/quick-entry')}
                  style={({ pressed }) => [
                    styles.addButton,
                    { backgroundColor: primaryColor },
                    pressed && styles.addButtonPressed,
                  ]}
                >
                  <Ionicons name="add" size={28} color="white" />
                </Pressable>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push('/quick-entry');
            },
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
      <Menu 
        isVisible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)} 
      />
    </MenuContext.Provider>
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
    paddingTop: Spacing.sm,
    gap: 4,
  },
  tabBarIcon: {
    marginBottom: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  addButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
