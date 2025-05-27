import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, SafeAreaView, Alert, View, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
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
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { useRef } from 'react';

export default function QuickEntryScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [timestamp, setTimestamp] = useState<Date | undefined>(new Date());
  const [numberOfBabies, setNumberOfBabies] = useState(1);
  const [babies, setBabies] = useState<Baby[]>([{ gender: 'boy', birthOrder: 1 }]);
  const [deliveryType, setDeliveryType] = useState<'vaginal' | 'c-section' | undefined>(undefined);
  const [eventType, setEventType] = useState<'delivery' | 'transition' | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Add theme color hooks
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    setDeliveryType(undefined);
    setEventType(undefined);
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
      timestamp && timestamp.getTime() === new Date().getTime() &&
      numberOfBabies === 1 &&
      babies.length === 1 && babies[0].gender === 'boy' && babies[0].birthOrder === 1 &&
      deliveryType === undefined &&
      eventType === undefined &&
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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      return (
        <Animated.View style={[styles.step, styles.successStep, { opacity: fadeAnim }]}>
          <View style={[styles.successIconContainer, { backgroundColor: successColor + '20' }]}>
            <Ionicons name="checkmark-circle" size={64} color={successColor} />
          </View>
          <ThemedText type="heading" style={styles.successTitle}>
            Birth Record Saved!
          </ThemedText>
          <ThemedText 
            type="body" 
            style={[styles.successText, { color: textSecondaryColor }]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            The birth record has been successfully saved to your records.
          </ThemedText>
        </Animated.View>
      );
    }

    // DateTime selection
    if (currentStep === 0) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText 
            type="heading" 
            style={styles.stepTitle}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            When did the birth occur?
          </ThemedText>
          <View style={styles.stepContent}>
            <DateTimePicker value={timestamp || new Date()} onChange={setTimestamp} />
          </View>
          <Button
            title="Skip"
            onPress={() => {
              setTimestamp(undefined);
              setCurrentStep(curr => curr + 1);
            }}
            variant="secondary"
            size="normal"
            style={styles.skipButton}
            icon={<Ionicons name="arrow-forward-outline" size={18} color={textSecondaryColor} />}
          />
        </ThemedView>
      );
    }
    
    // Number of babies
    if (currentStep === 1) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText 
            type="heading" 
            style={styles.stepTitle}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            How many babies?
          </ThemedText>
          <View style={styles.stepContent}>
            <MultipleBirthSelector value={numberOfBabies} onChange={handleNumberOfBabiesChange} />
          </View>
        </ThemedView>
      );
    }
    
    // Individual baby details (steps 2 to 2+numberOfBabies-1)
    const babyDetailsEndStep = 1 + numberOfBabies;
    if (currentStep > 1 && currentStep <= babyDetailsEndStep) {
      const babyIndex = currentStep - 2;
      return (
        <ThemedView style={styles.step}>
          <ThemedText 
            type="heading" 
            style={styles.stepTitle}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {numberOfBabies > 1 ? `Baby ${babyIndex + 1} Details` : 'Baby Details'}
          </ThemedText>
          <View style={styles.stepContent}>
            <BabyDetailsForm
              baby={babies[babyIndex]}
              onUpdate={(updatedBaby) => handleBabyUpdate(babyIndex, updatedBaby)}
            />
          </View>
        </ThemedView>
      );
    }
    
    // Delivery type
    const deliveryTypeStep = babyDetailsEndStep + 1;
    if (currentStep === deliveryTypeStep) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText 
            type="heading" 
            style={styles.stepTitle}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            Delivery type?
          </ThemedText>
          <View style={styles.stepContent}>
            <DeliveryTypeSelector value={deliveryType || 'vaginal'} onChange={setDeliveryType} />
          </View>
          <Button
            title="Skip"
            onPress={() => {
              setDeliveryType(undefined);
              setCurrentStep(curr => curr + 1);
            }}
            variant="secondary"
            size="normal"
            style={styles.skipButton}
            icon={<Ionicons name="arrow-forward-outline" size={18} color={textSecondaryColor} />}
          />
        </ThemedView>
      );
    }

    // Event Type (Delivery or Transition) - New Step
    const eventTypeStep = deliveryTypeStep + 1;
    if (currentStep === eventTypeStep) {
      return (
        <ThemedView style={styles.step}>
          <ThemedText 
            type="heading" 
            style={styles.stepTitle}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            Event Type?
          </ThemedText>
          <View style={[styles.stepContent, styles.selectorContainer]}>
            <Button
              title="Delivery"
              onPress={() => setEventType('delivery')}
              variant={eventType === 'delivery' ? 'primary' : 'secondary'}
              style={styles.selectorButton}
              icon={<Ionicons name="fitness-outline" size={20} color={eventType === 'delivery' ? 'white' : textColor} />}
            />
            <Button
              title="Transition"
              onPress={() => setEventType('transition')}
              variant={eventType === 'transition' ? 'primary' : 'secondary'}
              style={styles.selectorButton}
              icon={<Ionicons name="swap-horizontal-outline" size={20} color={eventType === 'transition' ? 'white' : textColor} />}
            />
          </View>
          <Button
            title="Skip"
            onPress={() => {
              setEventType(undefined);
              setCurrentStep(curr => curr + 1);
            }}
            variant="secondary"
            size="normal"
            style={styles.skipButton}
            icon={<Ionicons name="arrow-forward-outline" size={18} color={textSecondaryColor} />}
          />
        </ThemedView>
      );
    }
    
    // Notes (final step)
    return (
      <ThemedView style={styles.step}>
        <ThemedText 
          type="heading" 
          style={styles.stepTitle}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          Additional Notes
        </ThemedText>
        <View style={styles.stepContent}>
          <TextInput
            label="Notes (optional)"
            placeholder="Any additional details about the birth..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notes}
            leftIcon="document-text-outline"
          />
        </View>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {!showSuccess && <Stepper currentStep={currentStep} totalSteps={totalSteps} />}
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        <View style={[styles.buttonContainer, { backgroundColor: surfaceColor }]}>
          {showSuccess ? (
            <Button
              title="Add Another Record"
              onPress={resetForm}
              size="large"
              style={styles.button}
              icon={<Ionicons name="add-circle-outline" size={24} color="white" />}
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
                  icon={<Ionicons name="arrow-back" size={20} color={textColor} />}
                />
              )}
              <Button
                title={currentStep === totalSteps - 1 ? "Save" : "Next"}
                onPress={() => {
                  if (currentStep === totalSteps - 1) {
                    handleSubmit();
                  } else {
                    setCurrentStep(curr => curr + 1);
                  }
                }}
                size="large"
                style={styles.button}
                fullWidth={currentStep === 0}
                icon={<Ionicons 
                  name={currentStep === totalSteps - 1 ? "checkmark-circle" : "arrow-forward"} 
                  size={20} 
                  color="white" 
                />}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  step: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  stepContent: {
    marginTop: Spacing.lg,
  },
  stepTitle: {
    textAlign: 'center',
    marginHorizontal: Spacing.lg,
    lineHeight: Typography.lineHeights['2xl'] * 1.2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  button: {
    flex: 1,
  },
  notes: {
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  successStep: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    marginBottom: Spacing.sm,
  },
  successText: {
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: Typography.lineHeights.base * 1.2,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  selectorButton: {
    flex: 1,
    maxWidth: 200,
  },
  skipButton: {
    marginTop: Spacing.xl,
    alignSelf: 'center',
  },
});
