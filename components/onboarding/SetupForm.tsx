import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Button, SegmentedButtons } from 'react-native-paper';
import { saveUserPreferences } from '../../services/storage';
import { useThemeColor } from '../../hooks/useThemeColor';

interface SetupFormProps {
  onComplete: () => void;
}

export function SetupForm({ onComplete }: SetupFormProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [shift, setShift] = useState('day');
  const textColor = useThemeColor({}, 'text');

  const handleSubmit = async () => {
    await saveUserPreferences({
      name,
      unit,
      shift: shift as 'day' | 'night' | 'rotating',
      tutorialCompleted: true,
      theme: 'system',
    });
    onComplete();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>Setup Your Profile</Text>
      
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder="Your Name (Optional)"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder="Unit/Department"
        placeholderTextColor="#666"
        value={unit}
        onChangeText={setUnit}
      />

      <Text style={[styles.label, { color: textColor }]}>Shift Preference</Text>
      <SegmentedButtons
        value={shift}
        onValueChange={setShift}
        buttons={[
          { value: 'day', label: 'Day' },
          { value: 'night', label: 'Night' },
          { value: 'rotating', label: 'Rotating' },
        ]}
        style={styles.segment}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
      >
        Complete Setup
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  segment: {
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
}); 