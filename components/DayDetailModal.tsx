import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';
import type { BirthRecord, Baby } from '@/types';

interface DayDetailModalProps {
  visible: boolean;
  date: Date | null;
  records: BirthRecord[];
  onClose: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getGenderIcon(gender: Baby['gender']): {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
} {
  switch (gender) {
    case 'boy':
      return { name: 'male', color: '#2563EB' };
    case 'girl':
      return { name: 'female', color: '#DB2777' };
    case 'angel':
      return { name: 'star', color: '#F59E0B' };
    default:
      return { name: 'person', color: '#6B7280' };
  }
}

function getDeliveryTypeLabel(type?: 'vaginal' | 'c-section' | 'unknown'): string {
  switch (type) {
    case 'vaginal':
      return 'Vaginal';
    case 'c-section':
      return 'C-Section';
    default:
      return '';
  }
}

export function DayDetailModal({
  visible,
  date,
  records,
  onClose,
}: DayDetailModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const insets = useSafeAreaInsets();

  if (!date) return null;

  const isToday = new Date().toDateString() === date.toDateString();
  const isFuture = date > new Date();
  const hasRecords = records.length > 0;

  // Count babies
  const totalBabies = records.reduce((sum, r) => sum + r.babies.length, 0);
  const boys = records.reduce(
    (sum, r) => sum + r.babies.filter((b) => b.gender === 'boy').length,
    0
  );
  const girls = records.reduce(
    (sum, r) => sum + r.babies.filter((b) => b.gender === 'girl').length,
    0
  );
  const angels = records.reduce(
    (sum, r) => sum + r.babies.filter((b) => b.gender === 'angel').length,
    0
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>

        <View style={[styles.modalContainer, { backgroundColor: surfaceColor }]}>
          {/* Handle bar */}
          <View style={styles.handleBar}>
            <View style={styles.handle} />
          </View>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.dateRow}>
                {hasRecords && (
                  <View style={[styles.loggedBadge, { backgroundColor: '#FF6B35' }]}>
                    <MaterialCommunityIcons name="fire" size={14} color="white" />
                  </View>
                )}
                <ThemedText style={[styles.dateText, { color: textColor }]}>
                  {formatDate(date)}
                </ThemedText>
              </View>
              {isToday && (
                <View style={[styles.todayBadge, { backgroundColor: primaryColor + '20' }]}>
                  <ThemedText style={[styles.todayBadgeText, { color: primaryColor }]}>
                    Today
                  </ThemedText>
                </View>
              )}
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: textSecondaryColor + '15' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={textSecondaryColor} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, Spacing.xxl) + Spacing.lg }]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {isFuture ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: textSecondaryColor + '10' }]}>
                  <Ionicons name="calendar-outline" size={40} color={textSecondaryColor} />
                </View>
                <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                  Future Date
                </ThemedText>
                <ThemedText style={[styles.emptyDesc, { color: textSecondaryColor }]}>
                  No records yet for this day
                </ThemedText>
              </View>
            ) : !hasRecords ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: textSecondaryColor + '10' }]}>
                  <Ionicons name="moon-outline" size={40} color={textSecondaryColor} />
                </View>
                <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                  No Deliveries Logged
                </ThemedText>
                <ThemedText style={[styles.emptyDesc, { color: textSecondaryColor }]}>
                  {isToday
                    ? 'Add a birth record to log this day'
                    : 'No deliveries were recorded on this day'}
                </ThemedText>
              </View>
            ) : (
              <>
                {/* Summary */}
                <View style={[styles.summaryCard, { backgroundColor: backgroundColor }]}>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <ThemedText style={[styles.summaryValue, { color: textColor }]}>
                        {totalBabies}
                      </ThemedText>
                      <ThemedText style={[styles.summaryLabel, { color: textSecondaryColor }]}>
                        {totalBabies === 1 ? 'Baby' : 'Babies'}
                      </ThemedText>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <ThemedText style={[styles.summaryValue, { color: textColor }]}>
                        {records.length}
                      </ThemedText>
                      <ThemedText style={[styles.summaryLabel, { color: textSecondaryColor }]}>
                        {records.length === 1 ? 'Delivery' : 'Deliveries'}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Gender breakdown */}
                  <View style={styles.genderRow}>
                    {boys > 0 && (
                      <View style={styles.genderItem}>
                        <Ionicons name="male" size={16} color="#2563EB" />
                        <ThemedText style={[styles.genderCount, { color: '#2563EB' }]}>
                          {boys}
                        </ThemedText>
                      </View>
                    )}
                    {girls > 0 && (
                      <View style={styles.genderItem}>
                        <Ionicons name="female" size={16} color="#DB2777" />
                        <ThemedText style={[styles.genderCount, { color: '#DB2777' }]}>
                          {girls}
                        </ThemedText>
                      </View>
                    )}
                    {angels > 0 && (
                      <View style={styles.genderItem}>
                        <Ionicons name="star" size={16} color="#F59E0B" />
                        <ThemedText style={[styles.genderCount, { color: '#F59E0B' }]}>
                          {angels}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>

                {/* Individual records */}
                <ThemedText style={[styles.sectionTitle, { color: textSecondaryColor }]}>
                  Records
                </ThemedText>

                {records.map((record, index) => {
                  const deliveryLabel = getDeliveryTypeLabel(record.deliveryType);
                  const recordTime = record.timestamp
                    ? formatTime(new Date(record.timestamp))
                    : null;

                  return (
                    <View
                      key={record.id}
                      style={[styles.recordCard, { backgroundColor: backgroundColor }]}
                    >
                      <View style={styles.recordHeader}>
                        <View style={styles.recordBabies}>
                          {record.babies.map((baby, babyIndex) => {
                            const genderInfo = getGenderIcon(baby.gender);
                            return (
                              <View
                                key={babyIndex}
                                style={[
                                  styles.babyIcon,
                                  { backgroundColor: genderInfo.color + '15' },
                                ]}
                              >
                                <Ionicons
                                  name={genderInfo.name}
                                  size={18}
                                  color={genderInfo.color}
                                />
                              </View>
                            );
                          })}
                        </View>
                        {recordTime && (
                          <ThemedText style={[styles.recordTime, { color: textSecondaryColor }]}>
                            {recordTime}
                          </ThemedText>
                        )}
                      </View>

                      <View style={styles.recordDetails}>
                        <ThemedText style={[styles.recordTitle, { color: textColor }]}>
                          {record.babies.length === 1
                            ? `Baby ${record.babies[0].gender}`
                            : `${record.babies.length} babies`}
                        </ThemedText>
                        {deliveryLabel && (
                          <View style={styles.recordTags}>
                            <View
                              style={[styles.recordTag, { backgroundColor: primaryColor + '15' }]}
                            >
                              <ThemedText
                                style={[styles.recordTagText, { color: primaryColor }]}
                              >
                                {deliveryLabel}
                              </ThemedText>
                            </View>
                            {record.eventType && (
                              <View
                                style={[styles.recordTag, { backgroundColor: successColor + '15' }]}
                              >
                                <ThemedText
                                  style={[styles.recordTagText, { color: successColor }]}
                                >
                                  {record.eventType === 'delivery' ? 'Delivery' : 'Transition'}
                                </ThemedText>
                              </View>
                            )}
                          </View>
                        )}
                        {record.notes && (
                          <ThemedText
                            style={[styles.recordNotes, { color: textSecondaryColor }]}
                            numberOfLines={2}
                          >
                            {record.notes}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    minHeight: 320,
    maxHeight: '80%',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loggedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.bold,
    flex: 1,
  },
  todayBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  todayBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.semibold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: 0,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    fontSize: Typography.sm,
    textAlign: 'center',
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  summaryValue: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
  },
  summaryLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  genderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  genderCount: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  recordCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  recordBabies: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  babyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordTime: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  recordDetails: {
    gap: Spacing.xs,
  },
  recordTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  recordTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  recordTag: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  recordTagText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
  },
  recordNotes: {
    fontSize: Typography.sm,
    marginTop: Spacing.xs,
  },
});
