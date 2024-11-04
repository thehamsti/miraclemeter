import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value: number | string;
  subtitle?: string;
}

export function StatCard({ icon, iconColor, label, value, subtitle = 'Total' }: StatCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={[styles.card, { backgroundColor, borderColor }]}>
      <Ionicons name={icon} size={24} color={iconColor} />
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <ThemedText type="title">{value}</ThemedText>
      <ThemedText>{subtitle}</ThemedText>
    </ThemedView>
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