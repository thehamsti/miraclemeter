import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
  size?: 'normal' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
}

export function Button({
  title,
  onPress,
  style,
  loading = false,
  variant = 'primary',
  size = 'normal',
  icon,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tintColor = useThemeColor({}, 'tint');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const secondaryButtonColor = useThemeColor({}, 'secondaryButton');
  const secondaryButtonTextColor = useThemeColor({}, 'secondaryButtonText');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        size === 'large' && styles.buttonLarge,
        {
          backgroundColor: variant === 'primary' ? primaryButtonColor : secondaryButtonColor
        },
        pressed && styles.buttonPressed,
        style,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            color={tintColor} 
            size="small"
          />
        ) : (
          <>
            {icon}
            <ThemedText style={[
              styles.text,
              size === 'large' && styles.textLarge,
              variant === 'primary' ? { color: primaryButtonTextColor } : { color: secondaryButtonTextColor },
              icon ? styles.textWithIcon : null
            ]}>
              {title}
            </ThemedText>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonLarge: {
    padding: 20,
    minHeight: 68,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textLarge: {
    fontSize: 20,
  },
  textWithIcon: {
    marginLeft: 4,
  },
}); 