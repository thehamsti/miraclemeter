import { useState, useMemo, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Stepper } from '@/components/Stepper';
import { DateTimePicker } from '@/components/birth-entry/DateTimePicker';
import { DeliveryTypeSelector } from '@/components/birth-entry/DeliveryTypeSelector';
import { MultipleBirthSelector } from '@/components/birth-entry/MultipleBirthSelector';
import { BabyDetailsForm } from '@/components/birth-entry/BabyDetailsForm';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { saveBirthRecord } from '@/services/storage';
import type { Baby, BirthRecord } from '@/types';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function QuickEntryScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date());
  const [numberOfBabies, setNumberOfBabies] = useState(1);
  const [babies, setBabies] = useState<Baby[]>([{ gender: 'boy', birthOrder: 1 }]);
  const [deliveryType, setDeliveryType] = useState<'vaginal' | 'c-section'>('vaginal');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Add theme color hooks
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Calculate total steps based on number of babies
  const totalSteps = useMemo(() => {
    // Steps: DateTime + NumberOfBabies + (1 step per baby) + DeliveryType + Notes
    return 3 + numberOfBabies + 1;
  }, [numberOfBabies]);

  const handleBabyUpdate = (index: number, baby: Baby) => {
    const newBabies = [...babies];
    newBabies[index] = baby;
    setBabies(newBabies);
  };

  const handleNumberOfBabiesChange = (number: number) => {
    setNumberOfBabies(number);
    const newBabies = Array(number).fill(null).map((_, index) => ({
      ...babies[index] || { gender: 'boy', birthOrder: index + 1 }
    }));
    setBabies(newBabies);
  };

  const handleSubmit = async () => {
    const birthRecord: BirthRecord = {
      id: Date.now().toString(),
      timestamp,
      babies,
      deliveryType,
      notes: notes.trim() || undefined,
    };

    try {
      await saveBirthRecord(birthRecord);
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to save birth record:', error);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setTimestamp(new Date());
    setNumberOfBabies(1);
    setBabies([{ gender: 'boy', birthOrder: 1 }]);
    setDeliveryType('vaginal');
    setNotes('');
    setShowSuccess(false);
  };

  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [])
  );

  const handleReset = () => {
    if (currentStep === 0 && 
        timestamp.getTime() === new Date().getTime() && 
        numberOfBabies === 1 && 
        notes === '') {
      return; // No need to reset if already at initial state
    }

    Alert.alert(
      'Reset Form',
      'Are you sure you want to reset the form? All entered data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: resetForm,
          style: 'destructive'
        },
      ]
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="Reset"
          onPress={handleReset}
          variant="secondary"
          size="normal"
        />
      ),
    });
  }, [currentStep, timestamp, numberOfBabies, babies, deliveryType, notes]);

  const renderStep = () => {
    if (showSuccess) {
      return (
        <ThemedView style={[styles.step, styles.successStep]}>
          <Ionicons name="checkmark-circle" size={80} color={tintColor} />
          <ThemedText style={[styles.successTitle, { color: tintColor }]}>
            Birth Record Saved!
          </ThemedText>
          <ThemedText style={[styles.successText, { color: textColor }]}>
            The birth record has been successfully saved to your records.
          </ThemedText>
        </ThemedView>
      );
    }

    // DateTime selection
    if (currentStep === 0) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText type="title" style={styles.stepTitle}>When did the birth occur?</ThemedText>
          <DateTimePicker value={timestamp} onChange={setTimestamp} />
        </ThemedView>
      );
    }
    
    // Number of babies
    if (currentStep === 1) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText type="title" style={styles.stepTitle}>How many babies?</ThemedText>
          <MultipleBirthSelector value={numberOfBabies} onChange={handleNumberOfBabiesChange} />
        </ThemedView>
      );
    }
    
    // Individual baby details (steps 2 to 2+numberOfBabies-1)
    if (currentStep >= 2 && currentStep < 2 + numberOfBabies) {
      const babyIndex = currentStep - 2;
      return (
        <ThemedView style={styles.step}>
          <ThemedText style={styles.stepTitle}>
            {numberOfBabies > 1 ? `Baby ${babyIndex + 1} Details` : 'Baby Details'}
          </ThemedText>
          <BabyDetailsForm
            baby={babies[babyIndex]}
            onUpdate={(updatedBaby) => handleBabyUpdate(babyIndex, updatedBaby)}
          />
        </ThemedView>
      );
    }
    
    // Delivery type
    if (currentStep === 2 + numberOfBabies) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText type="title" style={styles.stepTitle}>Delivery type?</ThemedText>
          <DeliveryTypeSelector value={deliveryType} onChange={setDeliveryType} />
        </ThemedView>
      );
    }
    
    // Notes (final step)
    return (
      <ThemedView style={styles.step}>
        <ThemedText type="title" style={styles.stepTitle}>Additional Notes</ThemedText>
        <TextInput
          placeholder="Optional notes about the birth"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          style={styles.notes}
        />
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {!showSuccess && <Stepper currentStep={currentStep} totalSteps={totalSteps} />}
      
      <ThemedView style={styles.content}>
        {renderStep()}
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        {showSuccess ? (
          <Button
            title="Add Another Record"
            onPress={resetForm}
            size="large"
            style={styles.button}
          />
        ) : (
          <>
            {currentStep > 0 && (
              <Button
                title="Back"
                onPress={() => setCurrentStep(curr => curr - 1)}
                variant="secondary"
                size="large"
                style={styles.button}
              />
            )}
            <Button
              title={currentStep === totalSteps - 1 ? "Save Birth Record" : "Next"}
              onPress={() => {
                if (currentStep === totalSteps - 1) {
                  handleSubmit();
                } else {
                  setCurrentStep(curr => curr + 1);
                }
              }}
              size="large"
              style={styles.button}
            />
          </>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  step: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    flex: 1,
  },
  notes: {
    height: 120,
  },
  successStep: {
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});
