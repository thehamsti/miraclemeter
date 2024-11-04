import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Button } from '../Button';
import type { Baby } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface BabyDetailsFormProps {
  baby: Baby;
  onUpdate: (baby: Baby) => void;
}

export function BabyDetailsForm({ baby, onUpdate }: BabyDetailsFormProps) {
  const updateGender = (gender: Baby['gender']) => {
    onUpdate({ ...baby, gender });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerRow}>
        <Ionicons name="person" size={24} color="#4A90E2" />
        <ThemedText>Baby {baby.birthOrder}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Button
          title="Boy"
          onPress={() => updateGender('boy')}
          icon={<Ionicons name="male" size={20} color="white" />}
          style={StyleSheet.flatten([
            styles.button,
            baby.gender === 'boy' ? styles.selectedButton : undefined,
          ])}
        />
        <Button
          title="Girl"
          onPress={() => updateGender('girl')}
          icon={<Ionicons name="female" size={20} color="white" />}
          style={StyleSheet.flatten([
            styles.button,
            baby.gender === 'girl' ? styles.selectedButton : undefined,
          ])}
        />
        <Button
          title="Angel"
          onPress={() => updateGender('angel')}
          icon={<Ionicons name="star" size={20} color="white" />}
          style={StyleSheet.flatten([
            styles.button,
            baby.gender === 'angel' ? styles.selectedButton : undefined,
          ])}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#666666',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});