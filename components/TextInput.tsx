import { TextInput as RNTextInput, StyleSheet, type TextInputProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export function TextInput(props: TextInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <RNTextInput
      {...props}
      style={[
        styles.input,
        {
          color: isDark ? '#FFFFFF' : '#000000',
          backgroundColor: isDark ? '#333333' : '#F0F0F0',
        },
        props.style,
      ]}
      placeholderTextColor={isDark ? '#888888' : '#666666'}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
}); 