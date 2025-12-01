import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getBirthRecords } from '@/services/storage';
import { shareExport, getExportSummary, ExportError } from '@/services/export';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { ThemedSegmentedButtons } from '@/components/ThemedSegmentedButtons';
import { ThemedSwitch } from '@/components/ThemedSwitch';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { BirthRecord } from '@/types';

type ExportFormat = 'csv' | 'pdf';

export default function ExportScreen() {
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [anonymize, setAnonymize] = useState(false);
  const [exporting, setExporting] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const birthRecords = await getBirthRecords();
      setRecords(birthRecords);
    } catch (error) {
      console.error('Error loading records for export:', error);
      Alert.alert('Error', 'Failed to load records for export');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  const handleExport = useCallback(async () => {
    if (records.length === 0) {
      Alert.alert('No Data', 'There are no records to export');
      return;
    }

    try {
      setExporting(true);
      
      await shareExport(records, {
        format: exportFormat,
        includeNotes,
        anonymize,
      });

      Alert.alert(
        'Export Ready',
        `Your ${exportFormat.toUpperCase()} export has been prepared with ${records.length} records.`
      );
    } catch (error) {
      console.error('Export error:', error);
      
      if (error instanceof ExportError) {
        if (error.message.includes('not implemented')) {
          Alert.alert(
            'Coming Soon',
            'File sharing requires additional packages. The export data has been generated and logged to console.'
          );
        } else {
          Alert.alert('Export Error', error.message);
        }
      } else {
        Alert.alert('Export Error', 'An unexpected error occurred during export');
      }
    } finally {
      setExporting(false);
    }
  }, [records, exportFormat, includeNotes, anonymize]);

  const summary = records.length > 0 ? getExportSummary(records) : null;

  const formatButtons = [
    { value: 'csv', label: 'CSV' },
    { value: 'pdf', label: 'PDF' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <ThemedText style={[styles.title, { color: textColor }]}>
                Export Data
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: textSecondaryColor }]}>
                Export your birth records for credentialing and documentation
              </ThemedText>
            </View>
          </View>

          {/* Summary */}
          {summary && (
            <View style={[styles.summaryCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText style={[styles.summaryTitle, { color: textColor }]}>
                Export Summary
              </ThemedText>
              
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: textSecondaryColor }]}>
                  Total Records
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: textColor }]}>
                  {summary.totalRecords}
                </ThemedText>
              </View>
              
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: textSecondaryColor }]}>
                  Total Babies
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: textColor }]}>
                  {summary.babiesCount}
                </ThemedText>
              </View>

              {summary.dateRange && (
                <View style={styles.summaryRow}>
                  <ThemedText style={[styles.summaryLabel, { color: textSecondaryColor }]}>
                    Date Range
                  </ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: textColor }]}>
                    {summary.dateRange.start.toLocaleDateString()} - {summary.dateRange.end.toLocaleDateString()}
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Export Options */}
          <View style={[styles.optionsCard, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Export Options
            </ThemedText>

            {/* Format Selection */}
            <View style={styles.optionSection}>
              <ThemedText style={[styles.optionLabel, { color: textColor }]}>
                Format
              </ThemedText>
<ThemedSegmentedButtons
          value={exportFormat}
          onValueChange={(value) => setExportFormat(value as ExportFormat)}
          buttons={[
            { value: 'csv', label: 'CSV' },
            { value: 'pdf', label: 'PDF' },
          ]}
          style={styles.segmentedButtons}
        />
            </View>

            {/* Include Notes */}
            <View style={styles.optionSection}>
              <View style={styles.switchRow}>
                <View style={styles.switchContent}>
                  <ThemedText style={[styles.optionLabel, { color: textColor }]}>
                    Include Notes
                  </ThemedText>
                  <ThemedText style={[styles.optionDescription, { color: textSecondaryColor }]}>
                    Include personal notes in the export
                  </ThemedText>
                </View>
                <ThemedSwitch
                  value={includeNotes}
                  onValueChange={setIncludeNotes}
                />
              </View>
            </View>

            {/* Anonymize */}
            <View style={styles.optionSection}>
              <View style={styles.switchRow}>
                <View style={styles.switchContent}>
                  <ThemedText style={[styles.optionLabel, { color: textColor }]}>
                    Anonymize Data
                  </ThemedText>
                  <ThemedText style={[styles.optionDescription, { color: textSecondaryColor }]}>
                    Remove personal notes for sharing
                  </ThemedText>
                </View>
                <ThemedSwitch
                  value={anonymize}
                  onValueChange={setAnonymize}
                />
              </View>
            </View>
          </View>

          {/* Export Button */}
          <View style={styles.actions}>
            <Button
              title={exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
              onPress={handleExport}
              loading={exporting}
              disabled={records.length === 0 || exporting}
              style={styles.exportButton}
            />
            
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="secondary"
              style={styles.cancelButton}
            />
          </View>

          {/* Info */}
          <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle-outline" size={20} color={primaryColor} />
              <ThemedText style={[styles.infoTitle, { color: textColor }]}>
                Export Information
              </ThemedText>
            </View>
            <ThemedText style={[styles.infoText, { color: textSecondaryColor }]}>
              • CSV format can be opened in spreadsheet applications
              {'\n'}• PDF format is suitable for printing and documentation
              {'\n'}• All dates and times are included in your local timezone
              {'\n'}• Data is anonymized when the option is enabled
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    lineHeight: Typography.lineHeights.base,
  },
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  summaryValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
  },
  optionsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.lg,
  },
  optionSection: {
    marginBottom: Spacing.lg,
  },
  optionLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  optionDescription: {
    fontSize: Typography.sm,
    lineHeight: Typography.lineHeights.sm,
  },
  segmentedButtons: {
    marginTop: Spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  exportButton: {
    marginBottom: Spacing.sm,
  },
  cancelButton: {
    marginBottom: Spacing.sm,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  infoTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  infoText: {
    fontSize: Typography.sm,
    lineHeight: Typography.lineHeights.sm,
  },
});