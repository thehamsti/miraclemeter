import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import DateTimePickerNative from '@react-native-community/datetimepicker';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Button } from '../Button';
import { TouchableRipple } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const secondaryButtonTextColor = useThemeColor({}, 'secondaryButtonText');

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDateTime = new Date(value);
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());
      onChange(newDateTime);
    }
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDateTime = new Date(value);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      onChange(newDateTime);
    }
  };

  const setNow = () => onChange(new Date());
  
  const addThirtyMinutes = () => {
    const newDateTime = new Date(value);
    newDateTime.setMinutes(newDateTime.getMinutes() + 30);
    onChange(newDateTime);
  };

  const subtractThirtyMinutes = () => {
    const newDateTime = new Date(value);
    newDateTime.setMinutes(newDateTime.getMinutes() - 30);
    onChange(newDateTime);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.pickerSection}>
          <ThemedView style={[styles.pickerRow, { backgroundColor }]}>
            <Ionicons name="calendar-outline" size={24} color={secondaryButtonTextColor} />
            <ThemedText style={styles.label}>Date:</ThemedText>
            {Platform.OS === 'ios' ? (
              <DateTimePickerNative
                value={value}
                mode="date"
                onChange={handleDateChange}
                style={styles.picker}
              />
            ) : (
              <TouchableRipple onPress={() => setShowDatePicker(true)} style={[styles.pickerButton, { backgroundColor }]}>
                <ThemedText style={styles.pickerButtonText}>
                  {value.toLocaleDateString()}
                </ThemedText>
              </TouchableRipple>
            )}
          </ThemedView>

          <ThemedView style={[styles.pickerRow, { backgroundColor }]}>
            <Ionicons name="time-outline" size={24} color={secondaryButtonTextColor} />
            <ThemedText style={styles.label}>Time:</ThemedText>
            {Platform.OS === 'ios' ? (
              <DateTimePickerNative
                value={value}
                mode="time"
                onChange={handleTimeChange}
                style={styles.picker}
              />
            ) : (
              <TouchableRipple onPress={() => setShowTimePicker(true)} style={[styles.pickerButton, { backgroundColor }]}>
                <ThemedText style={styles.pickerButtonText}>
                  {value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </TouchableRipple>
            )}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <Button 
            title="Set to Current Time"
            onPress={setNow}
            style={styles.currentTimeButton}
          />
          <ThemedView style={styles.adjustButtonGroup}>
            <Button 
              title="-30m" 
              onPress={subtractThirtyMinutes}
              style={styles.adjustButton}
            />
            <Button 
              title="+30m" 
              onPress={addThirtyMinutes}
              style={styles.adjustButton}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePickerNative
          value={value}
          mode="date"
          onChange={handleDateChange}
        />
      )}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePickerNative
          value={value}
          mode="time"
          onChange={handleTimeChange}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    gap: 24,
    alignItems: 'center',
  },
  pickerSection: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 50,
  },
  picker: {
    flex: 1,
    height: 40,
  },
  pickerButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 16,
  },
  currentTimeButton: {
    width: '100%',
  },
  adjustButtonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  adjustButton: {
    flex: 1,
  }
});