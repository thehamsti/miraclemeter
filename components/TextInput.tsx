import { TextInput as RNTextInput, StyleSheet, type TextInputProps, View, Animated, Platform, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { useState, useRef, useEffect } from 'react';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface ExtendedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export function TextInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  onFocus,
  onBlur,
  ...props
}: ExtendedTextInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const borderLightColor = useThemeColor({}, 'borderLight');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColorAnimated = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? errorColor : borderColor, error ? errorColor : primaryColor],
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText 
          style={[
            styles.label, 
            { color: error ? errorColor : isFocused ? primaryColor : textSecondaryColor }
          ]}
          numberOfLines={1}
        >
          {label}
        </ThemedText>
      )}
      <Animated.View 
        style={[
          styles.inputContainer,
          {
            backgroundColor: surfaceColor,
            borderColor: borderColorAnimated,
            borderWidth: isFocused ? 2 : 1,
          },
          error && styles.inputError,
        ]}
      >
        {leftIcon && (
          <View style={styles.iconContainer}>
            <Ionicons 
              name={leftIcon} 
              size={20} 
              color={error ? errorColor : isFocused ? primaryColor : textSecondaryColor} 
            />
          </View>
        )}
        <RNTextInput
          {...props}
          style={[
            styles.input,
            {
              color: textColor,
              paddingLeft: leftIcon ? 0 : Spacing.md,
              paddingRight: rightIcon ? 0 : Spacing.md,
            },
            style,
          ]}
          placeholderTextColor={textSecondaryColor}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={primaryColor}
          accessibilityLabel={label}
        />
        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            style={({ pressed }) => [
              styles.iconContainer,
              pressed && styles.iconPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${label} action`}
          >
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={error ? errorColor : isFocused ? primaryColor : textSecondaryColor} 
            />
          </Pressable>
        )}
      </Animated.View>
      {(error || helperText) && (
        <ThemedText 
          style={[
            styles.helperText, 
            { color: error ? errorColor : textSecondaryColor }
          ]}
          numberOfLines={2}
        >
          {error || helperText}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.wide,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputError: {
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    lineHeight: Typography.lineHeights.base,
  },
  iconContainer: {
    paddingHorizontal: Spacing.md,
  },
  iconPressed: {
    opacity: 0.7,
  },
  helperText: {
    fontSize: Typography.xs,
    marginTop: Spacing.xs,
    lineHeight: Typography.lineHeights.xs,
  },
}); 