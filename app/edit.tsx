import { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Stepper } from '@/components/Stepper';
import { DateTimePicker } from '@/components/birth-entry/DateTimePicker';
import { DeliveryTypeSelector } from '@/components/birth-entry/DeliveryTypeSelector';
import { MultipleBirthSelector } from '@/components/birth-entry/MultipleBirthSelector';
import { BabyDetailsForm } from '@/components/birth-entry/BabyDetailsForm';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { updateBirthRecord } from '@/services/storage';
import type { BirthRecord } from '@/types';

export default function EditBirthScreen() {
  const { editRecord } = useLocalSearchParams<{ editRecord: string }>();
  const parsedRecord: BirthRecord = JSON.parse(editRecord);

  const [currentStep, setCurrentStep] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date(parsedRecord.timestamp));
  const [numberOfBabies, setNumberOfBabies] = useState(parsedRecord.babies.length);
  const [babies, setBabies] = useState(parsedRecord.babies);
  const [deliveryType, setDeliveryType] = useState<'vaginal' | 'c-section'>(
    parsedRecord.deliveryType === 'cesarean' ? 'c-section' : parsedRecord.deliveryType
  );
  const [notes, setNotes] = useState(parsedRecord.notes || '');

  // Calculate total steps
  const totalSteps = 3 + numberOfBabies + 1;

  const handleBabyUpdate = (index: number, baby: { gender: 'male' | 'female' }) => {
    const newBabies = [...babies];
    newBabies[index] = baby;
    setBabies(newBabies);
  };

  const handleNumberOfBabiesChange = (number: number) => {
    setNumberOfBabies(number);
    // Adjust babies array while preserving existing data
    const newBabies = Array(number).fill(null).map((_, index) => ({
      ...babies[index] || { gender: 'male' }
    }));
    setBabies(newBabies);
  };

  const handleSubmit = async () => {
    const updatedRecord: BirthRecord = {
      ...parsedRecord,
      timestamp,
      babies,
      deliveryType: deliveryType === 'c-section' ? 'cesarean' : deliveryType,
      notes: notes.trim() || undefined,
    };

    try {
      await updateBirthRecord(updatedRecord);
      router.back();
    } catch (error) {
      console.error('Failed to update birth record:', error);
      Alert.alert('Error', 'Failed to update birth record');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Editing',
      'Are you sure you want to cancel? All changes will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive',
          onPress: () => router.back()
        },
      ]
    );
  };

  const renderStep = () => {
    // DateTime selection
    if (currentStep === 0) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText style={styles.stepTitle}>When did the birth occur?</ThemedText>
          <DateTimePicker value={timestamp} onChange={setTimestamp} />
        </ThemedView>
      );
    }
    
    // Number of babies
    if (currentStep === 1) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText style={styles.stepTitle}>How many babies?</ThemedText>
          <MultipleBirthSelector value={numberOfBabies} onChange={handleNumberOfBabiesChange} />
        </ThemedView>
      );
    }
    
    // Individual baby details
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
          <ThemedText style={styles.stepTitle}>Delivery type?</ThemedText>
          <DeliveryTypeSelector value={deliveryType} onChange={setDeliveryType} />
        </ThemedView>
      );
    }
    
    // Notes (final step)
    return (
      <ThemedView style={styles.step}>
        <ThemedText style={styles.stepTitle}>Additional Notes</ThemedText>
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
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Edit Birth Record</ThemedText>
      </ThemedView>

      <Stepper currentStep={currentStep} totalSteps={totalSteps} />
      
      <ThemedView style={styles.content}>
        {renderStep()}
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="secondary"
          size="large"
          style={styles.button}
        />
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
          title={currentStep === totalSteps - 1 ? "Save Changes" : "Next"}
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
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: '600',
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
});