import React, { useState, useCallback } from 'react';
import { StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { getBirthRecords, deleteBirthRecord } from '@/services/storage';
import { BirthRecord } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TextInput } from '@/components/TextInput';
import { IconButton } from '@/components/IconButton';
import { FlatList } from 'react-native';
import { router, Link } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HistoryScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [searchQuery, setSearchQuery] = useState('');
  const [birthRecords, setBirthRecords] = useState<BirthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BirthRecord[]>([]);
  const isFocused = useIsFocused();

  const loadBirthRecords = async () => {
    const records = await getBirthRecords();
    setBirthRecords(records);
    setFilteredRecords(records);
  };

  useFocusEffect(
    useCallback(() => {
      loadBirthRecords();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = birthRecords.filter(record => {
      const timestamp = record.timestamp ? (record.timestamp instanceof Date ? record.timestamp : new Date(record.timestamp)) : null;
      const dateStr = timestamp ? formatDate(timestamp) : 'Unknown Date';
      return (
        record.notes?.toLowerCase().includes(query.toLowerCase()) ||
        dateStr.toLowerCase().includes(query.toLowerCase())
      );
    });
    setFilteredRecords(filtered);
  };

  const handleEdit = (record: BirthRecord) => {
    router.push({
      pathname: "/edit",
      params: { editRecord: JSON.stringify(record) }
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
    const deliveryStr = item.deliveryType === 'vaginal' ? 'Vaginal' : 
                       item.deliveryType === 'c-section' ? 'C-Section' : 
                       'Unknown';
    const eventStr = item.eventType ? (item.eventType === 'delivery' ? 'Delivery' : 'Transition') : '';

    return (
      <ThemedView style={[styles.card, { backgroundColor }]}>
        <ThemedView style={styles.cardContent}>
          <ThemedText style={styles.date}>{dateStr}</ThemedText>

          <ThemedView style={styles.mainContent}>
            <ThemedView style={styles.birthInfo}>
              <ThemedText numberOfLines={1}>
                {item.babies.length} {item.babies.length > 1 ? 'babies' : 'baby'} • {deliveryStr}{eventStr ? ` • ${eventStr}` : ''}
              </ThemedText>
              {item.notes && (
                <ThemedText numberOfLines={1} style={[styles.notes, { color: textColor }]}>
                  {item.notes}
                </ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.actions}>
              <IconButton
                name="pencil"
                size={18}
                onPress={() => handleEdit(item)}
                color={tintColor}
              />
              <IconButton
                name="trash-can"
                size={18}
                onPress={() => handleDelete(item)}
                color="#ff4444"
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  };

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyState}>
      <ThemedText style={styles.emptyStateText}>
        No birth records yet! Head over to the{' '}
        <Link href="/" style={[styles.link, { color: tintColor }]}>Home tab</Link>
        {' '}to create your first record.
      </ThemedText>
    </ThemedView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">History</ThemedText>
      </ThemedView>
      
      {birthRecords.length > 0 ? (
        <>
          <TextInput
            placeholder="Search records..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor }]}
          />

          <FlatList
            data={filteredRecords}
            renderItem={renderBirthRecord}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
          />
        </>
      ) : renderEmptyState()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    padding: 20,
    gap: 8,
  },
  searchbar: {
    margin: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    padding: 5,
    borderRadius: 12,
    gap: 4,
  },
  cardContent: {
    gap: 4,
    padding: 6
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  birthInfo: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
