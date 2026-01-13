import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Button } from '../Button';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DeliveryTypeSelectorProps {
  value: 'vaginal' | 'c-section' | 'unknown';
  onChange: (type: 'vaginal' | 'c-section' | 'unknown') => void;
}

export function DeliveryTypeSelector({ value, onChange }: DeliveryTypeSelectorProps) {
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const secondaryButtonTextColor = useThemeColor({}, 'secondaryButtonText');

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerRow}>
        <Ionicons name="medical" size={24} color={secondaryButtonTextColor} />
        <ThemedText>Delivery Type</ThemedText>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Button
          title="Vaginal"
          onPress={() => onChange('vaginal')}
          icon={<Ionicons name="woman" size={20} color={value === 'vaginal' ? primaryButtonTextColor : secondaryButtonTextColor} />}
          style={styles.button}
          variant={value === 'vaginal' ? 'primary' : 'secondary'}
        />
        <Button
          title="C-Section"
          onPress={() => onChange('c-section')}
          icon={<Ionicons name="cut" size={20} color={value === 'c-section' ? primaryButtonTextColor : secondaryButtonTextColor} />}
          style={styles.button}
          variant={value === 'c-section' ? 'primary' : 'secondary'}
        />
        <Button
          title="Unknown"
          onPress={() => onChange('unknown')}
          icon={<Ionicons name="help-circle" size={20} color={value === 'unknown' ? primaryButtonTextColor : secondaryButtonTextColor} />}
          style={styles.button}
          variant={value === 'unknown' ? 'primary' : 'secondary'}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  button: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});