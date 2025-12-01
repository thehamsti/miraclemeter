import { useState, useEffect } from 'react';
import { StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, View, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { DateTimePicker } from '@/components/birth-entry/DateTimePicker';
import { DeliveryTypeSelector } from '@/components/birth-entry/DeliveryTypeSelector';
import { BabyDetailsForm } from '@/components/birth-entry/BabyDetailsForm';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { updateBirthRecord, getBirthRecordById, deleteBirthRecord } from '@/services/storage';
import type { BirthRecord, Baby } from '@/types';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Module-level cache to prevent duplicate fetches across component instances
const recordCache: Record<string, BirthRecord> = {};

export default function EditBirthScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // Initialize from cache if available
  const [record, setRecord] = useState<BirthRecord | null>(id ? recordCache[id] || null : null);
  const [timestamp, setTimestamp] = useState(new Date());
  const [babies, setBabies] = useState<Baby[]>([{ gender: 'boy', birthOrder: 1 }]);
  const [deliveryType, setDeliveryType] = useState<'vaginal' | 'c-section' | 'unknown'>('unknown');
  const [eventType, setEventType] = useState<'delivery' | 'transition'>('delivery');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    // Skip if no id or already have record loaded
    if (!id || record) return;

    // Check cache first
    const cached = recordCache[id];

    if (!cached) {
      // Fetch from storage
      getBirthRecordById(id).then((fetchedRecord) => {
        if (!fetchedRecord) {
          Alert.alert('Error', 'Record not found');
          router.back();
          return;
        }
        recordCache[id] = fetchedRecord;
        setRecord(fetchedRecord);
        setTimestamp(fetchedRecord.timestamp ? new Date(fetchedRecord.timestamp) : new Date());
        setBabies(fetchedRecord.babies);
        setDeliveryType(fetchedRecord.deliveryType || 'unknown');
        setEventType(fetchedRecord.eventType || 'delivery');
        setNotes(fetchedRecord.notes || '');
      });
    } else {
      // Use cached
      setRecord(cached);
      setTimestamp(cached.timestamp ? new Date(cached.timestamp) : new Date());
      setBabies(cached.babies);
      setDeliveryType(cached.deliveryType || 'unknown');
      setEventType(cached.eventType || 'delivery');
      setNotes(cached.notes || '');
    }
  }, [id, record]);

  const handleBabyUpdate = (index: number, baby: Baby) => {
    const newBabies = [...babies];
    newBabies[index] = baby;
    setBabies(newBabies);
  };

  const handleSave = async () => {
    if (!record || saving) return;
    setSaving(true);

    try {
      await updateBirthRecord({
        ...record,
        timestamp,
        babies,
        deliveryType,
        eventType,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes');
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!record) return;

    Alert.alert(
      'Delete Record',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBirthRecord(record.id);
            router.back();
          },
        },
      ]
    );
  };

  if (!record) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit Record',
          headerStyle: { backgroundColor: surfaceColor },
          headerTintColor: textColor,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor }]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Date & Time */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={20} color={primaryColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Date & Time
              </ThemedText>
            </View>
            <DateTimePicker value={timestamp} onChange={setTimestamp} />
          </View>

          {/* Delivery Type */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical-outline" size={20} color={primaryColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Delivery Type
              </ThemedText>
            </View>
            <DeliveryTypeSelector value={deliveryType} onChange={setDeliveryType} />
          </View>

          {/* Event Type */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="swap-horizontal-outline" size={20} color={primaryColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Event Type
              </ThemedText>
            </View>
            <View style={styles.eventTypeRow}>
              <Pressable
                style={[
                  styles.eventTypeButton,
                  { borderColor: eventType === 'delivery' ? primaryColor : borderColor },
                  eventType === 'delivery' && { backgroundColor: primaryColor + '15' },
                ]}
                onPress={() => setEventType('delivery')}
              >
                <Ionicons
                  name="fitness-outline"
                  size={20}
                  color={eventType === 'delivery' ? primaryColor : textSecondaryColor}
                />
                <ThemedText
                  style={[
                    styles.eventTypeText,
                    { color: eventType === 'delivery' ? primaryColor : textSecondaryColor },
                  ]}
                >
                  Delivery
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.eventTypeButton,
                  { borderColor: eventType === 'transition' ? primaryColor : borderColor },
                  eventType === 'transition' && { backgroundColor: primaryColor + '15' },
                ]}
                onPress={() => setEventType('transition')}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={20}
                  color={eventType === 'transition' ? primaryColor : textSecondaryColor}
                />
                <ThemedText
                  style={[
                    styles.eventTypeText,
                    { color: eventType === 'transition' ? primaryColor : textSecondaryColor },
                  ]}
                >
                  Transition
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Babies */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={20} color={primaryColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {babies.length > 1 ? `Babies (${babies.length})` : 'Baby'}
              </ThemedText>
            </View>
            {babies.map((baby, index) => (
              <View key={index} style={styles.babySection}>
                {babies.length > 1 && (
                  <ThemedText style={[styles.babyLabel, { color: textSecondaryColor }]}>
                    Baby {index + 1}
                  </ThemedText>
                )}
                <BabyDetailsForm
                  baby={baby}
                  onUpdate={(updated) => handleBabyUpdate(index, updated)}
                />
              </View>
            ))}
          </View>

          {/* Notes */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={primaryColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Notes
              </ThemedText>
            </View>
            <TextInput
              placeholder="Optional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </View>

          {/* Delete Button */}
          <Pressable
            style={[styles.deleteButton, { borderColor: errorColor }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color={errorColor} />
            <ThemedText style={[styles.deleteText, { color: errorColor }]}>
              Delete Record
            </ThemedText>
          </Pressable>
        </ScrollView>

        {/* Save Button */}
        <View style={[styles.footer, { backgroundColor: surfaceColor }]}>
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            size="large"
            fullWidth
            disabled={saving}
            icon={<Ionicons name="checkmark-circle" size={20} color="white" />}
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Platform.select({
      ios: Shadows.sm,
      android: { elevation: 2 },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  eventTypeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  eventTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  eventTypeText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  babySection: {
    marginTop: Spacing.sm,
  },
  babyLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginTop: Spacing.md,
  },
  deleteText: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
