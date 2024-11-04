import React from 'react';
import { Switch, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ThemedSwitch({ value, onValueChange }: ThemedSwitchProps) {
  const switchTrackActive = useThemeColor({}, 'switchTrackActive');
  const switchTrackInactive = useThemeColor({}, 'switchTrackInactive');
  const switchThumbActive = useThemeColor({}, 'switchThumbActive');
  const switchThumbInactive = useThemeColor({}, 'switchThumbInactive');

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ 
        false: switchTrackInactive, 
        true: switchTrackActive 
      }}
      thumbColor={value ? switchThumbActive : switchThumbInactive}
    />
  );
} 