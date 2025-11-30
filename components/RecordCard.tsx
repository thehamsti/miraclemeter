import React from 'react';
import { StyleSheet, View, Pressable, ViewStyle, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor, useShadowOpacity } from '@/hooks/useThemeColor';
import { BirthRecord } from '@/types';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { formatDistanceToNow } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import { useRef } from 'react';

interface RecordCardProps {
  record?: BirthRecord;
  placeholder?: string;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  showActions?: boolean;
}

export function RecordCard({ record, placeholder, style, onPress, showActions = true }: RecordCardProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceElevatedColor = useThemeColor({}, 'surfaceElevated');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const textTertiaryColor = useThemeColor({}, 'textTertiary');
  const borderColor = useThemeColor({}, 'border');
  const borderLightColor = useThemeColor({}, 'borderLight');
  const primaryColor = useThemeColor({}, 'primary');
  const primaryLightColor = useThemeColor({}, 'primaryLight');
  const maleColor = useThemeColor({}, 'male');
  const femaleColor = useThemeColor({}, 'female');
  const warningColor = useThemeColor({}, 'warning');
  const shadowColor = useThemeColor({}, 'shadowColor');
  const shadowOpacity = useShadowOpacity();

  if (!record) {
    return (
      <View style={[
        styles.card, 
        styles.placeholderCard,
        { 
          backgroundColor: surfaceColor, 
          borderColor: borderLightColor,
        }, 
        style
      ]}>
        <View style={[styles.placeholderIconContainer, { backgroundColor: borderLightColor }]}>
          <Ionicons name="document-outline" size={32} color={textTertiaryColor} />
        </View>
        <ThemedText style={[styles.placeholderText, { color: textSecondaryColor }]}>
          {placeholder || 'No data available'}
        </ThemedText>
      </View>
    );
  }

  const date = record.timestamp ? new Date(record.timestamp) : null;
  const isValidDate = date && !isNaN(date.getTime());
  const timeAgo = isValidDate ? formatDistanceToNow(date) : null;
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (showActions) {
      router.push({
        pathname: '/edit',
        params: { id: record.id }
      });
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'boy':
        return <Ionicons name="male" size={16} color={maleColor} />;
      case 'girl':
        return <Ionicons name="female" size={16} color={femaleColor} />;
      case 'angel':
        return <Ionicons name="star" size={16} color={warningColor} />;
      default:
        return null;
    }
  };

  const getDeliveryIcon = (type?: string) => {
    if (!type) return 'help-circle-outline';
    switch (type) {
      case 'vaginal':
        return 'fitness-outline';
      case 'c-section':
        return 'medical-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.card,
          { 
            backgroundColor: surfaceColor,
            shadowColor,
            shadowOpacity: pressed ? shadowOpacity * 0.5 : shadowOpacity,
          },
          pressed && styles.cardPressed
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <View style={[styles.dateIconContainer, { backgroundColor: primaryLightColor }]}>
              <Ionicons name="calendar-outline" size={18} color={primaryColor} />
            </View>
            <View style={styles.dateTextContainer}>
              <ThemedText 
                style={[styles.dateText, { color: textColor }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {isValidDate ? date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Unknown Date'}
              </ThemedText>
              <ThemedText 
                style={[styles.timeText, { color: textSecondaryColor }]}
                numberOfLines={1}
              >
                {timeAgo || 'Time unknown'}
              </ThemedText>
            </View>
          </View>
        
          {showActions && (
            <Pressable
              onPress={() => router.push({
                pathname: '/edit',
                params: { id: record.id }
              })}
              style={({ pressed }) => [
                styles.moreButton,
                { backgroundColor: pressed ? borderLightColor : 'transparent' }
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={textSecondaryColor} />
            </Pressable>
          )}
        </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <View style={[styles.infoItem, styles.infoItemWithBg, { backgroundColor: borderLightColor }]}>
            <Ionicons 
              name={getDeliveryIcon(record.deliveryType)} 
              size={18} 
              color={textSecondaryColor} 
            />
            <ThemedText 
              style={[styles.infoText, { color: textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {record.deliveryType === 'vaginal' ? 'Vaginal' : 
               record.deliveryType === 'c-section' ? 'C-Section' : 
               'Unknown'}
            </ThemedText>
          </View>

          {record.eventType && (
            <View style={[styles.infoItem, styles.infoItemWithBg, { backgroundColor: borderLightColor }]}>
              <Ionicons 
                name={record.eventType === 'delivery' ? 'fitness-outline' : 'swap-horizontal-outline'} 
                size={18} 
                color={textSecondaryColor} 
              />
              <ThemedText 
                style={[styles.infoText, { color: textColor }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {record.eventType === 'delivery' ? 'Delivery' : 'Transition'}
              </ThemedText>
            </View>
          )}

          <View style={[styles.infoItem, styles.infoItemWithBg, { backgroundColor: borderLightColor }]}>
            <Ionicons 
              name={record.babies.length > 1 ? "people-outline" : "person-outline"} 
              size={18} 
              color={textSecondaryColor} 
            />
            <ThemedText 
              style={[styles.infoText, { color: textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {record.babies.length > 1 ? `${record.babies.length} Babies` : 'Single Birth'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.babiesContainer}>
          {record.babies.map((baby, index) => {
            const genderColor = baby.gender === 'boy' ? maleColor : 
                               baby.gender === 'girl' ? femaleColor : warningColor;
            return (
              <View 
                key={index} 
                style={[
                  styles.babyChip, 
                  { 
                    backgroundColor: genderColor + '15',
                    borderColor: genderColor + '30',
                  }
                ]}
              >
                {getGenderIcon(baby.gender)}
                <ThemedText 
                  style={[styles.babyText, { color: textColor }]}
                  numberOfLines={1}
                >
                  {baby.birthOrder > 0 ? `Baby ${baby.birthOrder}` : 'Baby'}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {record.notes && (
          <View style={[styles.notesContainer, { backgroundColor: surfaceElevatedColor, borderColor: borderLightColor }]}>
            <Ionicons name="document-text-outline" size={16} color={textSecondaryColor} />
            <ThemedText 
              style={[styles.notesText, { color: textSecondaryColor }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {record.notes}
            </ThemedText>
          </View>
        )}
      </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: {
        ...Shadows.md,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardPressed: {
    opacity: 0.98,
  },
  placeholderCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    shadowOpacity: 0,
    elevation: 0,
  },
  placeholderIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.base,
  },
  timeText: {
    fontSize: Typography.xs,
    lineHeight: Typography.lineHeights.xs,
    marginTop: 2,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoItemWithBg: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  infoText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.lineHeights.sm,
  },
  babiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  babyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  babyText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.xs,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
    borderWidth: 1,
  },
  notesText: {
    fontSize: Typography.sm,
    flex: 1,
    lineHeight: Typography.lineHeights.sm,
  },
});