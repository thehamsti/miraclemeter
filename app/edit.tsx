import { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Stepper } from '@/components/Stepper';
import { DateTimePicker } from '@/components/birth-entry/DateTimePicker';
import { DeliveryTypeSelector } from '@/components/birth-entry/DeliveryTypeSelector';
import { MultipleBirthSelector } from '@/components/birth-entry/MultipleBirthSelector';
import { BabyDetailsForm } from '@/components/birth-entry/BabyDetailsForm';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { updateBirthRecord, getBirthRecordById, deleteBirthRecord } from '@/services/storage';
import type { BirthRecord, Baby } from '@/types';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function EditBirthScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<BirthRecord | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date());
  const [numberOfBabies, setNumberOfBabies] = useState(1);
  const [babies, setBabies] = useState<Baby[]>([{ gender: 'boy', birthOrder: 1 }]);
  const [deliveryType, setDeliveryType] = useState<'Vaginal' | 'C-Section' | 'Assisted'>('Vaginal');
  const [eventType, setEventType] = useState<'delivery' | 'transition'>('delivery');
  const [notes, setNotes] = useState('');
  
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  // Load the record when component mounts
  useEffect(() => {
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    if (!id) {
      Alert.alert('Error', 'No record ID provided');
      router.back();
      return;
    }

    try {
      const fetchedRecord = await getBirthRecordById(id);
      if (!fetchedRecord) {
        Alert.alert('Error', 'Record not found');
        router.back();
        return;
      }

      setRecord(fetchedRecord);
      setTimestamp(fetchedRecord.timestamp ? new Date(fetchedRecord.timestamp) : new Date());
      setNumberOfBabies(fetchedRecord.babies.length);
      setBabies(fetchedRecord.babies);
      setDeliveryType((fetchedRecord.deliveryType || 'vaginal') as 'Vaginal' | 'C-Section' | 'Assisted');
      setEventType(fetchedRecord.eventType || 'delivery');
      setNotes(fetchedRecord.notes || '');
      setLoading(false);
    } catch (error) {
      console.error('Error loading record:', error);
      Alert.alert('Error', 'Failed to load record');
      router.back();
    }
  };

  // Calculate total steps based on number of babies
  const totalSteps = 3 + numberOfBabies + 1 + 1; // DateTime + NumberOfBabies + (1 per baby) + DeliveryType + EventType + Notes

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
    if (!record) return;

    const updatedRecord: BirthRecord = {
      ...record,
      timestamp,
      babies,
      deliveryType,
      eventType,
      notes: notes.trim() || undefined,
    };

    try {
      await updateBirthRecord(updatedRecord);
      Alert.alert('Success', 'Birth record updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to update birth record:', error);
      Alert.alert('Error', 'Failed to update birth record');
    }
  };

  const handleDelete = () => {
    if (!record) return;

    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this birth record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBirthRecord(record.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete record');
            }
          }
        },
      ]
    );
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textSecondaryColor }]}>
            Loading record...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const renderStep = () => {
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
            <DateTimePicker value={timestamp} onChange={setTimestamp} />
          </View>
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
            <DeliveryTypeSelector value={deliveryType} onChange={setDeliveryType} />
          </View>
        </ThemedView>
      );
    }

    // Event Type
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
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Edit Birth Record',
          headerStyle: { backgroundColor: surfaceColor },
          headerTintColor: textColor,
          headerRight: () => (
            <Button
              title="Delete"
              onPress={handleDelete}
              variant="danger"
              size="small"
              icon={<Ionicons name="trash-outline" size={16} color="white" />}
            />
          ),
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Stepper currentStep={currentStep} totalSteps={totalSteps} />
          
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderStep()}
          </ScrollView>

          <View style={[styles.buttonContainer, { backgroundColor: surfaceColor }]}>
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
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.base,
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
});