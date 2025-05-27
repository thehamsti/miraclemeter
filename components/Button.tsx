import { Pressable, StyleSheet, type ViewStyle, Animated, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { useRef } from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'small' | 'normal' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  adjustsFontSizeToFit?: boolean;
}

export function Button({
  title,
  onPress,
  style,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'normal',
  icon,
  fullWidth = false,
  adjustsFontSizeToFit = true,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const tintColor = useThemeColor({}, 'tint');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const secondaryButtonColor = useThemeColor({}, 'secondaryButton');
  const secondaryButtonTextColor = useThemeColor({}, 'secondaryButtonText');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      size === 'small' && styles.buttonSmall,
      size === 'large' && styles.buttonLarge,
      fullWidth && styles.buttonFullWidth,
    ];

    switch (variant) {
      case 'primary':
        return [...baseStyle, { backgroundColor: primaryButtonColor }];
      case 'secondary':
        return [...baseStyle, styles.buttonSecondary, { backgroundColor: secondaryButtonColor }];
      case 'tertiary':
        return [...baseStyle, styles.buttonTertiary, { borderColor }];
      case 'danger':
        return [...baseStyle, { backgroundColor: errorColor }];
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return primaryButtonTextColor;
      case 'secondary':
        return secondaryButtonTextColor;
      case 'tertiary':
        return textColor;
      default:
        return primaryButtonTextColor;
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        style={({ pressed }) => [
          ...getButtonStyle(),
          (disabled || loading) && styles.buttonDisabled,
          pressed && !disabled && !loading && styles.buttonPressed,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator 
              color={variant === 'tertiary' ? textColor : primaryButtonTextColor} 
              size={size === 'small' ? 'small' : 'small'}
            />
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <ThemedText 
                style={[
                  styles.text,
                  size === 'small' && styles.textSmall,
                  size === 'large' && styles.textLarge,
                  { color: getTextColor() },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={adjustsFontSizeToFit}
                minimumFontScale={0.8}
              >
                {title}
              </ThemedText>
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadows.sm,
  },
  buttonSmall: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  buttonLarge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonSecondary: {
    ...Platform.select({
      ios: Shadows.sm,
      android: { elevation: 1 },
    }),
  },
  buttonTertiary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    marginRight: -4,
  },
  text: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    letterSpacing: Typography.letterSpacing.wide,
  },
  textSmall: {
    fontSize: Typography.sm,
  },
  textLarge: {
    fontSize: Typography.lg,
  },
}); 