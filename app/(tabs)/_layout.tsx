import { Tabs, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Menu } from '@/components/Menu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const showMenu = !pathname.includes('quick-entry');

  const MenuButton = () => (
    <Pressable 
      onPress={() => setIsMenuVisible(true)}
      style={[
        styles.menuButton,
        { top: insets.top + 8 }
      ]}
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
          tabBarStyle: { backgroundColor },
          headerShown: false,
          tabBarLabelStyle: { color: textColor },
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
  menuButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
