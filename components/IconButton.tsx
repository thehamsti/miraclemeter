import React from 'react';
import { StyleSheet, Pressable, PressableProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface IconButtonProps extends PressableProps {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  size?: number;
  color?: string;
  accessibilityLabel: string;
}

export function IconButton({ name, size = 24, color, style, accessibilityLabel, ...props }: IconButtonProps) {
  const iconColor = useThemeColor({}, 'text');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        style
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      <MaterialCommunityIcons 
        name={name} 
        size={size} 
        color={color || iconColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
}); 