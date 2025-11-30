/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useTheme } from './ThemeContext';
import { Colors, ShadowOpacity } from '@/constants/Colors';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
): string {
  const { effectiveTheme } = useTheme();
  const colorFromProps = props[effectiveTheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[effectiveTheme][colorName];
}

export function useShadowOpacity(): number {
  const { effectiveTheme } = useTheme();
  return ShadowOpacity[effectiveTheme];
}
