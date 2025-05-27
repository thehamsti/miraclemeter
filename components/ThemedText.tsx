import { Text, type TextProps, StyleSheet, Platform } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Typography } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'body' | 'heading';
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  adjustsFontSizeToFit = false,
  minimumFontScale = 0.85,
  numberOfLines,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Enable font size adjustment for long text to prevent clipping
  // Only auto-adjust if adjustsFontSizeToFit is not explicitly set to false
  const shouldAdjustFontSize = adjustsFontSizeToFit === true || (adjustsFontSizeToFit !== false && numberOfLines && numberOfLines > 0);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'heading' ? styles.heading : undefined,
        style,
      ]}
      adjustsFontSizeToFit={shouldAdjustFontSize}
      minimumFontScale={minimumFontScale}
      numberOfLines={numberOfLines}
      ellipsizeMode={numberOfLines ? 'tail' : undefined}
      {...rest}
    />
  );
}

const getFontFamily = (weight: string = 'regular') => {
  if (Platform.OS === 'ios') {
    switch (weight) {
      case 'bold':
      case '700':
        return 'Avenir-Heavy';
      case 'semibold':
      case '600':
        return 'Avenir-Medium';
      case 'medium':
      case '500':
        return 'Avenir-Medium';
      default:
        return 'Avenir';
    }
  }
  // Android and web use system fonts with weights
  return Platform.select({
    android: 'Roboto',
    default: 'System',
  });
};

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.base,
    lineHeight: Typography.lineHeights.base,
    fontFamily: getFontFamily(),
    letterSpacing: Typography.letterSpacing.normal,
  },
  defaultSemiBold: {
    fontSize: Typography.base,
    lineHeight: Typography.lineHeights.base,
    fontWeight: Typography.weights.semibold,
    fontFamily: getFontFamily('semibold'),
    letterSpacing: Typography.letterSpacing.normal,
  },
  title: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights['3xl'],
    fontFamily: getFontFamily('bold'),
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.xl,
    fontFamily: getFontFamily('semibold'),
    letterSpacing: Typography.letterSpacing.normal,
  },
  link: {
    fontSize: Typography.base,
    lineHeight: Typography.lineHeights.base,
    color: '#14B8A6',
    fontFamily: getFontFamily('medium'),
    textDecorationLine: 'underline',
  },
  caption: {
    fontSize: Typography.xs,
    lineHeight: Typography.lineHeights.xs,
    fontFamily: getFontFamily(),
    letterSpacing: Typography.letterSpacing.wide,
  },
  body: {
    fontSize: Typography.base,
    lineHeight: Typography.lineHeights.base,
    fontFamily: getFontFamily(),
    letterSpacing: Typography.letterSpacing.normal,
  },
  heading: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights['2xl'],
    fontFamily: getFontFamily('bold'),
    letterSpacing: Typography.letterSpacing.tight,
  },
});
