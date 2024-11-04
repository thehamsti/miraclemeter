import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Animated, { 
  withSpring, 
  useAnimatedStyle, 
  useSharedValue 
} from 'react-native-reanimated';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value: number | string;
  subtitle?: string;
}

const iconMap = {
  boys: '👶',
  girls: '👶‍♀️',
  angels: '👼',
  today: '📅',
  week: '📊',
  vaginal: '🌟',
  csection: '✨'
};

export function StatCard({ icon, iconColor, label, value, subtitle = 'Total' }: StatCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const secondaryButtonTextColor = useThemeColor({}, 'secondaryButtonText');

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }]
  }));

  const handlePress = () => {
    scale.value = 1.1;
    setTimeout(() => {
      scale.value = 1;
    }, 200);
  };

  return (
    <Animated.View style={[animatedStyle, { flex: 1 }]}>
      <Pressable onPress={handlePress}>
        <ThemedView style={[styles.card, { backgroundColor, borderColor }]}>
          <Ionicons name={icon} size={24} color={iconColor || secondaryButtonTextColor} />
          <ThemedText type="defaultSemiBold">{label}</ThemedText>
          <ThemedText type="title">{value}</ThemedText>
          <ThemedText>{subtitle}</ThemedText>
        </ThemedView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}); 