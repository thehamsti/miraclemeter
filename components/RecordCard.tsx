import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BirthRecord } from '@/types';

interface RecordCardProps {
  record?: BirthRecord;
  placeholder?: string;
}

export function RecordCard({ record, placeholder }: RecordCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  if (!record) {
    return (
      <ThemedView style={[styles.card, { backgroundColor, borderColor }]}>
        <ThemedText style={[styles.placeholderText, { color: textColor }]}>
          {placeholder || 'No data available'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.card, { backgroundColor, borderColor }]}>
      <ThemedText type="defaultSemiBold">
        <Ionicons name="calendar" size={16} /> {new Date(record.timestamp).toLocaleDateString()}
      </ThemedText>
      <ThemedText>
        <Ionicons name="people" size={16} /> {record.babies.length > 1 ? 'Multiple Birth' : 'Single Birth'}
      </ThemedText>
      <ThemedText>
        <Ionicons name="medical" size={16} /> {record.deliveryType}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    textAlign: 'center',
    opacity: 0.6,
  },
}); 