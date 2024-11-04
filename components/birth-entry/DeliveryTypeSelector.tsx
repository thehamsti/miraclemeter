import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Button } from '../Button';
import { Ionicons } from '@expo/vector-icons';

interface DeliveryTypeSelectorProps {
  value: 'vaginal' | 'c-section';
  onChange: (type: 'vaginal' | 'c-section') => void;
}

export function DeliveryTypeSelector({ value, onChange }: DeliveryTypeSelectorProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerRow}>
        <Ionicons name="medical" size={24} color="#4A90E2" />
        <ThemedText>Delivery Type</ThemedText>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Button
          title="Vaginal"
          onPress={() => onChange('vaginal')}
          icon={<Ionicons name="woman" size={20} color="white" />}
          style={StyleSheet.flatten([
            styles.button,
            value === 'vaginal' ? styles.selectedButton : undefined,
          ])}
        />
        <Button
          title="C-Section"
          onPress={() => onChange('c-section')}
          icon={<Ionicons name="cut" size={20} color="white" />}
          style={StyleSheet.flatten([
            styles.button,
            value === 'c-section' ? styles.selectedButton : undefined,
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