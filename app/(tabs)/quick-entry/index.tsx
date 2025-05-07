import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, SafeAreaView, Alert, View } from 'react-native';
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
import { useThemeColor } from '@/hooks/useThemeColor';

export default function QuickEntryScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date());
  const [numberOfBabies, setNumberOfBabies] = useState(1);
  const [babies, setBabies] = useState<Baby[]>([{ gender: 'boy', birthOrder: 1 }]);
  const [deliveryType, setDeliveryType] = useState<'vaginal' | 'c-section'>('vaginal');
  const [eventType, setEventType] = useState<'delivery' | 'transition'>('delivery');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Add theme color hooks
  const backgroundColor = useThemeColor({}, 'background');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Calculate total steps based on number of babies
  const totalSteps = useMemo(() => {
    // Steps: DateTime + NumberOfBabies + (1 step per baby) + DeliveryType + EventType + Notes
    return 3 + numberOfBabies + 1 + 1;
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
      eventType,
      notes: notes.trim() || undefined,
    };

    try {
      await saveBirthRecord(birthRecord);
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to save birth record:', error);
      Alert.alert("Error", "Failed to save birth record. Please try again.");
    }
  };

  const resetForm = useCallback(() => {
    setCurrentStep(0);
    setTimestamp(new Date());
    setNumberOfBabies(1);
    setBabies([{ gender: 'boy', birthOrder: 1 }]);
    setDeliveryType('vaginal');
    setEventType('delivery');
    setNotes('');
    setShowSuccess(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetForm();
      return () => {
        // Optional: any cleanup if needed when screen loses focus
      };
    }, [resetForm])
  );

  const handleReset = useCallback(() => {
    const isInitialState = currentStep === 0 &&
      timestamp.getTime() === new Date().getTime() &&
      numberOfBabies === 1 &&
      babies.length === 1 && babies[0].gender === 'boy' && babies[0].birthOrder === 1 &&
      deliveryType === 'vaginal' &&
      eventType === 'delivery' &&
      notes === '';

    if (isInitialState && !showSuccess) {
        return;
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
  }, [currentStep, timestamp, numberOfBabies, babies, deliveryType, eventType, notes, resetForm, showSuccess]);

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
  }, [navigation, handleReset]);

  const renderStep = () => {
    if (showSuccess) {
      return (
        <ThemedView style={[styles.step, styles.successStep]}>
          <Ionicons name="checkmark-circle" size={80} color={primaryButtonColor} />
          <ThemedText type="title">
            Birth Record Saved!
          </ThemedText>
          <ThemedText type="subtitle" style={styles.successText}>
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
    const babyDetailsEndStep = 1 + numberOfBabies;
    if (currentStep > 1 && currentStep <= babyDetailsEndStep) {
      const babyIndex = currentStep - 2;
      return (
        <ThemedView style={styles.step}>
          <ThemedText style={styles.stepTitle} type="title">
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
    const deliveryTypeStep = babyDetailsEndStep + 1;
    if (currentStep === deliveryTypeStep) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText type="title" style={styles.stepTitle}>Delivery type?</ThemedText>
          <DeliveryTypeSelector value={deliveryType} onChange={setDeliveryType} />
        </ThemedView>
      );
    }

    // Event Type (Delivery or Transition) - New Step
    const eventTypeStep = deliveryTypeStep + 1;
    if (currentStep === eventTypeStep) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText type="title" style={styles.stepTitle}>Event Type?</ThemedText>
          <View style={styles.selectorContainer}>
            <Button
              title="Delivery"
              onPress={() => setEventType('delivery')}
              variant={eventType === 'delivery' ? 'primary' : 'secondary'}
              style={styles.selectorButton}
            />
            <Button
              title="Transition"
              onPress={() => setEventType('transition')}
              variant={eventType === 'transition' ? 'primary' : 'secondary'}
              style={styles.selectorButton}
            />
          </View>
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
    textAlignVertical: 'top',
  },
  successStep: {
    alignItems: 'center',
    gap: 16,
  },
  successText: {
    textAlign: 'center',
    opacity: 0.8,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 12,
  },
  selectorButton: {
    flex: 1,
  },
});
