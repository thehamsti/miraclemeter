import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Button } from '../Button';
import type { Baby } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface BabyDetailsFormProps {
  baby: Baby;
  onUpdate: (baby: Baby) => void;
}

export function BabyDetailsForm({ baby, onUpdate }: BabyDetailsFormProps) {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const secondaryButtonTextColor = useThemeColor({}, 'secondaryButtonText');


  const updateGender = (gender: Baby['gender']) => {
    onUpdate({ ...baby, gender });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerRow}>
        <Ionicons name="person" size={24} color={secondaryButtonTextColor} />
        <ThemedText>Baby {baby.birthOrder}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Button
          title="Boy"
          onPress={() => updateGender('boy')}
          icon={<Ionicons name="male" size={20} color={baby.gender === 'boy' ? primaryButtonTextColor : secondaryButtonTextColor} />}
          style={StyleSheet.flatten([
            styles.button,
          ])}
          variant={baby.gender === 'boy' ? 'primary' : 'secondary'}
        />
        <Button
          title="Girl"
          onPress={() => updateGender('girl')}
          icon={<Ionicons name="female" size={20} color={baby.gender === 'girl' ? primaryButtonTextColor : secondaryButtonTextColor} />}
          style={StyleSheet.flatten([
            styles.button,
          ])}
          variant={baby.gender === 'girl' ? 'primary' : 'secondary'}
        />
        <Button
          title="Angel"
          onPress={() => updateGender('angel')}
          icon={<Ionicons name="star" size={20} color={baby.gender === 'angel' ? primaryButtonTextColor : secondaryButtonTextColor} />}
          style={StyleSheet.flatten([
            styles.button,
          ])}
          variant={baby.gender === 'angel' ? 'primary' : 'secondary'}
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});