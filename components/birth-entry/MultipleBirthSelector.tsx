import { StyleSheet, Modal } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface MultipleBirthSelectorProps {
  value: number;
  onChange: (number: number) => void;
}

export function MultipleBirthSelector({ value, onChange }: MultipleBirthSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [customNumber, setCustomNumber] = useState('');
  
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const secondaryButtonTextColor = useThemeColor({}, 'secondaryButtonText');
  const overlayBackground = useThemeColor({}, 'overlayBackground');

  const handleCustomSubmit = () => {
    const num = parseInt(customNumber);
    if (num && num > 4) {
      onChange(num);
      setShowModal(false);
      setCustomNumber('');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.buttonGrid}>
        <ThemedView style={styles.row}>
          <Button
            title="1 Baby"
            onPress={() => onChange(1)}
            variant={value === 1 ? 'primary' : 'secondary'}
            icon={<Ionicons name="person" size={20} color={value === 1 ? primaryButtonTextColor : secondaryButtonTextColor} />}
            size="large" 
            style={styles.gridButton}
          />
          <Button
            title="2 Babies"
            onPress={() => onChange(2)}
            variant={value === 2 ? 'primary' : 'secondary'}
            icon={<Ionicons name="people" size={20} color={value === 2 ? primaryButtonTextColor : secondaryButtonTextColor} />}
            size="large"
            style={styles.gridButton}
          />
        </ThemedView>
        <ThemedView style={styles.row}>
          <Button
            title="3 Babies"
            onPress={() => onChange(3)}
            variant={value === 3 ? 'primary' : 'secondary'}
            icon={<Ionicons name="people" size={20} color={value === 3 ? primaryButtonTextColor : secondaryButtonTextColor} />}
            size="large"
            style={styles.gridButton}
          />
          <Button
            title="4 Babies"
            onPress={() => onChange(4)}
            variant={value === 4 ? 'primary' : 'secondary'}
            icon={<Ionicons name="people" size={20} color={value === 4 ? primaryButtonTextColor : secondaryButtonTextColor} />}
            size="large"
            style={styles.gridButton}
          />
        </ThemedView>
        <Button
          title="More than 4!"
          onPress={() => setShowModal(true)}
          variant={value > 4 ? 'primary' : 'secondary'}
          icon={<Ionicons name="add-circle" size={20} color={value > 4 ? primaryButtonTextColor : secondaryButtonTextColor} />}
          size="large"
          style={styles.moreButton}
        />
      </ThemedView>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <ThemedView style={[styles.modalOverlay, { backgroundColor: overlayBackground }]}>
          <ThemedView style={[styles.modalContent, { backgroundColor }]}>
            <ThemedView style={styles.modalTitleContainer}>
              <Ionicons name="people" size={24} color={tintColor} />
              <ThemedText style={styles.modalTitle}>Enter number of babies</ThemedText>
            </ThemedView>
            <TextInput
              value={customNumber}
              onChangeText={setCustomNumber}
              keyboardType="number-pad"
              placeholder="Enter a number greater than 4"
              style={styles.input}
            />
            <ThemedView style={styles.modalButtons}>
              <Button 
                title="Cancel" 
                onPress={() => setShowModal(false)}
                variant="secondary"
              />
              <Button 
                title="Confirm" 
                onPress={handleCustomSubmit}
                variant="primary"
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonGrid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  gridButton: {
    flex: 1,
    minHeight: 64,
  },
  moreButton: {
    minHeight: 64,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  input: {
    marginBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
}); 