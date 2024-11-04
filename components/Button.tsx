import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
  size?: 'normal' | 'large';
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  style,
  variant = 'primary',
  size = 'normal',
  icon,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        size === 'large' && styles.buttonLarge,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        isDark && variant === 'secondary' && styles.secondaryButtonDark,
        pressed && styles.buttonPressed,
        style,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {icon}
        <ThemedText style={[
          styles.text,
          size === 'large' && styles.textLarge,
          variant === 'secondary' ? styles.secondaryText : null,
          icon ? styles.textWithIcon : null
        ]}>
          {title}
        </ThemedText>
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
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
  },
  secondaryButtonDark: {
    backgroundColor: '#333333',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textLarge: {
    fontSize: 20,
  },
  secondaryText: {
    color: '#007AFF',
  },
  textWithIcon: {
    marginLeft: 4,
  },
}); 