import { Stack } from 'expo-router';
import { StyleSheet, SafeAreaView, Linking } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function SupportScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Support the Developer',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.description}>
            Hey there! 👋 This app was created with love for my amazing wife Kelly, who inspired me to build something to help midwives and labor and delivery nurses track births. If you're enjoying it and want to show some appreciation, you can buy me a virtual coffee! ✨
          </ThemedText>
          <Button 
            title="Buy Me a Coffee ☕️" 
            onPress={() => Linking.openURL('https://coff.ee/hamstico')}
            style={styles.button}
          />
          <Button 
            title="Send Feedback 💬" 
            onPress={() => Linking.openURL('mailto:john@hamsti.co')}
            style={styles.button}
          />
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  description: {
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
}); 