import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, ScrollView, View, Linking, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface License {
  name: string;
  license: string;
  url?: string;
}

const licenses: License[] = [
  {
    name: 'React',
    license: 'MIT License',
    url: 'https://github.com/facebook/react',
  },
  {
    name: 'React Native',
    license: 'MIT License',
    url: 'https://github.com/facebook/react-native',
  },
  {
    name: 'Expo',
    license: 'MIT License',
    url: 'https://github.com/expo/expo',
  },
  {
    name: 'Expo Router',
    license: 'MIT License',
    url: 'https://github.com/expo/router',
  },
  {
    name: 'Expo Blur',
    license: 'MIT License',
    url: 'https://github.com/expo/expo/tree/main/packages/expo-blur',
  },
  {
    name: 'Expo Linear Gradient',
    license: 'MIT License',
    url: 'https://github.com/expo/expo/tree/main/packages/expo-linear-gradient',
  },
  {
    name: 'React Native Paper',
    license: 'MIT License',
    url: 'https://github.com/callstack/react-native-paper',
  },
  {
    name: 'React Native Reanimated',
    license: 'MIT License',
    url: 'https://github.com/software-mansion/react-native-reanimated',
  },
  {
    name: 'React Native Gesture Handler',
    license: 'MIT License',
    url: 'https://github.com/software-mansion/react-native-gesture-handler',
  },
  {
    name: 'React Native Screens',
    license: 'MIT License',
    url: 'https://github.com/software-mansion/react-native-screens',
  },
  {
    name: 'React Native Safe Area Context',
    license: 'MIT License',
    url: 'https://github.com/th3rdwave/react-native-safe-area-context',
  },
  {
    name: 'React Native SVG',
    license: 'MIT License',
    url: 'https://github.com/software-mansion/react-native-svg',
  },
  {
    name: 'React Native Chart Kit',
    license: 'MIT License',
    url: 'https://github.com/indiespirit/react-native-chart-kit',
  },
  {
    name: 'React Native Confetti Cannon',
    license: 'MIT License',
    url: 'https://github.com/VincentCATILLON/react-native-confetti-cannon',
  },
  {
    name: 'React Native View Shot',
    license: 'MIT License',
    url: 'https://github.com/gre/react-native-view-shot',
  },
  {
    name: '@expo/vector-icons',
    license: 'MIT License',
    url: 'https://github.com/expo/vector-icons',
  },
  {
    name: 'Ionicons',
    license: 'MIT License',
    url: 'https://github.com/ionic-team/ionicons',
  },
  {
    name: 'AsyncStorage',
    license: 'MIT License',
    url: 'https://github.com/react-native-async-storage/async-storage',
  },
  {
    name: 'DateTimePicker',
    license: 'MIT License',
    url: 'https://github.com/react-native-datetimepicker/datetimepicker',
  },
];

export default function LicensesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const insets = useSafeAreaInsets();

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Open Source Licenses',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <View style={[styles.introCard, { backgroundColor: primaryColor + '10' }]}>
          <Ionicons name="heart" size={24} color={primaryColor} />
          <ThemedText style={[styles.introText, { color: textColor }]}>
            Miracle Meter is built with amazing open source software. We're grateful to the developers and communities behind these projects.
          </ThemedText>
        </View>

        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Libraries & Frameworks
        </ThemedText>

        <View style={styles.licenseList}>
          {licenses.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => item.url && handleOpenUrl(item.url)}
              style={({ pressed }) => [
                styles.licenseItem,
                { backgroundColor: surfaceColor },
                pressed && item.url && styles.licenseItemPressed,
              ]}
              disabled={!item.url}
            >
              <View style={styles.licenseContent}>
                <ThemedText style={[styles.licenseName, { color: textColor }]}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[styles.licenseType, { color: textSecondaryColor }]}>
                  {item.license}
                </ThemedText>
              </View>
              {item.url && (
                <Ionicons name="open-outline" size={18} color={textSecondaryColor} />
              )}
            </Pressable>
          ))}
        </View>

        <View style={[styles.footer, { borderTopColor: surfaceColor }]}>
          <ThemedText style={[styles.footerText, { color: textSecondaryColor }]}>
            All libraries listed above are used under their respective licenses. Tap any item to view its source repository.
          </ThemedText>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  introText: {
    flex: 1,
    fontSize: Typography.sm,
    lineHeight: Typography.lineHeights.sm,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  licenseList: {
    gap: Spacing.sm,
  },
  licenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  licenseItemPressed: {
    opacity: 0.7,
  },
  licenseContent: {
    flex: 1,
  },
  licenseName: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
  },
  licenseType: {
    fontSize: Typography.sm,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: Typography.xs,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.xs,
  },
});
