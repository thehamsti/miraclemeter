import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, SafeAreaView, Linking } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function FeedbackScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleSubmit = () => {
    // Implement feedback submission logic
    Linking.openURL('mailto:your-email@example.com?subject=Birth Tracker Feedback');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Send Feedback',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.description}>
            We&apos;d love to hear your thoughts on how we can improve the app!
          </ThemedText>
          <TextInput
            placeholder="Your feedback..."
            multiline
            numberOfLines={6}
            style={styles.input}
          />
          <Button 
            title="Send Feedback" 
            onPress={handleSubmit}
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
  },
  input: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 20,
  },
}); 