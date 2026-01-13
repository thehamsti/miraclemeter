import React, { useState, useCallback } from 'react';
import { StyleSheet, Alert, ScrollView, View, Platform, Pressable, RefreshControl } from 'react-native';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { getBirthRecords, deleteBirthRecord } from '@/services/storage';
import { BirthRecord } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TextInput as RNTextInput } from 'react-native';
import { IconButton } from '@/components/IconButton';
import { FlatList } from 'react-native';
import { router, Link } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';

export default function HistoryScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const maleColor = useThemeColor({}, 'male');
  const femaleColor = useThemeColor({}, 'female');

  const [searchQuery, setSearchQuery] = useState('');
  const [birthRecords, setBirthRecords] = useState<BirthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BirthRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const loadBirthRecords = async () => {
    const records = await getBirthRecords();
    // Sort records by timestamp (newest first)
    const sortedRecords = records.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    });
    setBirthRecords(sortedRecords);
    setFilteredRecords(sortedRecords);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBirthRecords();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBirthRecords();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredRecords(birthRecords);
      return;
    }
    const filtered = birthRecords.filter(record => {
      const timestamp = record.timestamp ? (record.timestamp instanceof Date ? record.timestamp : new Date(record.timestamp)) : null;
      const dateStr = timestamp ? formatDate(timestamp) : 'Unknown Date';
      const deliveryStr = record.deliveryType === 'vaginal' ? 'Vaginal' : 
                         record.deliveryType === 'c-section' ? 'C-Section' : 
                         'Unknown';
      return (
        record.notes?.toLowerCase().includes(query.toLowerCase()) ||
        dateStr.toLowerCase().includes(query.toLowerCase()) ||
        deliveryStr.toLowerCase().includes(query.toLowerCase()) ||
        record.babies.some(baby => baby.gender?.toLowerCase().includes(query.toLowerCase()))
      );
    });
    setFilteredRecords(filtered);
  };

  const handleEdit = (record: BirthRecord) => {
    router.push({
      pathname: "/edit",
      params: { id: record.id }
    });
  };

  const handleDelete = async (record: BirthRecord) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this birth record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteBirthRecord(record.id);
            loadBirthRecords();
          }
        }
      ]
    );
  };

  const renderBirthRecord = ({ item }: { item: BirthRecord }) => {
    const timestamp = item.timestamp ? (item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp)) : null;
    const dateStr = timestamp ? formatDate(timestamp) : 'Unknown Date';
    const timeStr = timestamp ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const deliveryStr = item.deliveryType === 'vaginal' ? 'Vaginal' : 
                       item.deliveryType === 'c-section' ? 'C-Section' : 
                       'Unknown';
    const eventStr = item.eventType ? (item.eventType === 'delivery' ? 'Delivery' : 'Transition') : '';

    const getDeliveryIcon = () => {
      if (item.deliveryType === 'vaginal') return 'fitness-outline';
      if (item.deliveryType === 'c-section') return 'medical-outline';
      return 'help-circle-outline';
    };

    const getDeliveryColor = () => {
      if (item.deliveryType === 'vaginal') return successColor;
      if (item.deliveryType === 'c-section') return primaryColor;
      return errorColor;
    };

    const genderCounts = item.babies.reduce((acc, baby) => {
      if (baby.gender === 'boy') acc.boys++;
      else if (baby.gender === 'girl') acc.girls++;
      else if (baby.gender === 'angel') acc.angels++;
      return acc;
    }, { boys: 0, girls: 0, angels: 0 });

    return (
      <Pressable
        style={({ pressed }) => [
          styles.recordCard,
          { backgroundColor: surfaceColor },
          pressed && styles.recordCardPressed,
        ]}
        onPress={() => handleEdit(item)}
      >
        <View style={styles.recordHeader}>
          <View style={styles.dateTimeContainer}>
            <ThemedText style={[styles.recordDate, { color: textColor }]}>
              {dateStr}
            </ThemedText>
            {timeStr && (
              <ThemedText style={[styles.recordTime, { color: textSecondaryColor }]}>
                {timeStr}
              </ThemedText>
            )}
          </View>
          <View style={styles.recordActions}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: primaryColor + '15' }]}
              onPress={() => handleEdit(item)}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name="pencil" size={16} color={primaryColor} />
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: errorColor + '15' }]}
              onPress={() => handleDelete(item)}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name="trash-outline" size={16} color={errorColor} />
            </Pressable>
          </View>
        </View>

        <View style={styles.recordContent}>
          <View style={[styles.deliveryTypeContainer, { backgroundColor: getDeliveryColor() + '15' }]}>
            <Ionicons name={getDeliveryIcon()} size={20} color={getDeliveryColor()} />
            <ThemedText style={[styles.deliveryTypeText, { color: getDeliveryColor() }]}>
              {deliveryStr}{eventStr ? ` • ${eventStr}` : ''}
            </ThemedText>
          </View>

          <View style={styles.babiesContainer}>
            <View style={styles.babyCountContainer}>
              <Ionicons name="people-outline" size={16} color={textSecondaryColor} />
              <ThemedText style={[styles.babyCountText, { color: textColor }]}>
                {item.babies.length} {item.babies.length > 1 ? 'babies' : 'baby'}
              </ThemedText>
            </View>

            {(genderCounts.boys > 0 || genderCounts.girls > 0 || genderCounts.angels > 0) && (
              <View style={styles.genderBreakdown}>
                {genderCounts.boys > 0 && (
                  <View style={styles.genderItem}>
                    <Ionicons name="male" size={14} color={maleColor} />
                    <ThemedText style={[styles.genderCount, { color: textSecondaryColor }]}>
                      {genderCounts.boys}
                    </ThemedText>
                  </View>
                )}
                {genderCounts.girls > 0 && (
                  <View style={styles.genderItem}>
                    <Ionicons name="female" size={14} color={femaleColor} />
                    <ThemedText style={[styles.genderCount, { color: textSecondaryColor }]}>
                      {genderCounts.girls}
                    </ThemedText>
                  </View>
                )}
                {genderCounts.angels > 0 && (
                  <View style={styles.genderItem}>
                    <Ionicons name="star" size={14} color={warningColor} />
                    <ThemedText style={[styles.genderCount, { color: textSecondaryColor }]}>
                      {genderCounts.angels}
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>

          {item.notes && item.notes.trim() && (
            <View style={[styles.notesContainer, { backgroundColor: primaryColor + '08', borderColor: primaryColor + '20' }]}>
              <Ionicons name="document-text-outline" size={14} color={textSecondaryColor} />
              <ThemedText style={[styles.notesText, { color: textSecondaryColor }]} numberOfLines={2}>
                {item.notes.trim()}
              </ThemedText>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
      <View style={[styles.emptyIconContainer, { backgroundColor: primaryColor + '10' }]}>
        <Ionicons name="time-outline" size={64} color={primaryColor} />
      </View>
      <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
        No Records Found
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: textSecondaryColor }]}>
        {searchQuery ? 
          'No records match your search. Try adjusting your search terms.' :
          'Start tracking births to see your delivery history here.'
        }
      </ThemedText>
      {!searchQuery && (
        <Link href="/quick-entry" asChild>
          <Pressable style={[styles.emptyActionButton, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.emptyActionText}>
              Add Your First Record
            </ThemedText>
          </Pressable>
        </Link>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={[primaryColor, primaryColor + '95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={[styles.headerTitle, { color: 'white' }]}>
              Birth History
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {birthRecords.length} {birthRecords.length === 1 ? 'record' : 'records'} total
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      {birthRecords.length > 0 ? (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBarWrapper, { backgroundColor: surfaceColor }]}>
              <View style={styles.searchIconContainer}>
                <Ionicons name="search-outline" size={24} color={textSecondaryColor} />
              </View>
              <RNTextInput
                placeholder="Search by date, notes, or delivery type..."
                onChangeText={handleSearch}
                value={searchQuery}
                style={[styles.searchInput, { color: textColor }]}
                placeholderTextColor={textSecondaryColor}
                returnKeyType="search"
                clearButtonMode="while-editing"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <Pressable 
                  onPress={() => handleSearch('')} 
                  style={styles.clearButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={22} color={textSecondaryColor} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Results Summary */}
          {searchQuery && (
            <View style={styles.resultsContainer}>
              <ThemedText style={[styles.resultsText, { color: textSecondaryColor }]}>
                {filteredRecords.length} {filteredRecords.length === 1 ? 'result' : 'results'} found
              </ThemedText>
            </View>
          )}

          {/* Records List */}
          <FlatList
            data={filteredRecords}
            renderItem={renderBirthRecord}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={primaryColor}
              />
            }
            ListEmptyComponent={searchQuery ? renderEmptyState : null}
          />
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyScrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primaryColor}
            />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
    letterSpacing: Typography.letterSpacing.wide,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 56,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchIconContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.weights.regular,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    lineHeight: Typography.lineHeights.base,
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  resultsText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 120,
    gap: Spacing.md,
  },
  emptyScrollContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  recordCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  recordCardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  dateTimeContainer: {
    flex: 1,
  },
  recordDate: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
  },
  recordTime: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
  },
  recordActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordContent: {
    gap: Spacing.md,
  },
  deliveryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  deliveryTypeText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
  },
  babiesContainer: {
    gap: Spacing.sm,
  },
  babyCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  babyCountText: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
  },
  genderBreakdown: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  genderCount: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  notesText: {
    flex: 1,
    fontSize: Typography.sm,
    lineHeight: Typography.lineHeights.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.base,
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  emptyActionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyActionText: {
    color: 'white',
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
  },
});
