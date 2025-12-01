import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemedSegmentedButtonsProps {
  value: string;
  onValueChange: (value: string) => void;
  buttons: {
    value: string;
    label: string;
    icon?: string;
  }[];
  style?: StyleProp<ViewStyle>;
}

export function ThemedSegmentedButtons({ 
  value, 
  onValueChange, 
  buttons, 
  style 
}: ThemedSegmentedButtonsProps) {
  const textColor = useThemeColor({}, 'text');
  const segmentedButtonActive = useThemeColor({}, 'segmentedButtonActive');
  const segmentedButtonInactive = useThemeColor({}, 'segmentedButtonInactive');
  const borderColor = useThemeColor({}, 'border');

  return (
    <SegmentedButtons
      value={value}
      onValueChange={onValueChange}
      buttons={buttons}
      style={style}
      theme={{
        colors: {
          primary: segmentedButtonActive,
          onSurface: textColor,
          secondaryContainer: segmentedButtonInactive,
          onSecondaryContainer: textColor,
          outline: borderColor,
        },
      }}
    />
  );
} 