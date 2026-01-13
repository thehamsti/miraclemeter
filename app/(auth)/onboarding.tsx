import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { completeOnboarding, saveUserPreferences } from '@/services/storage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { TextInput } from '@/components/TextInput';
import { ThemedSegmentedButtons } from '@/components/ThemedSegmentedButtons';
import { BorderRadius, Spacing, Typography } from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  decorations: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    size: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    rotation: number;
    opacity: number;
  }>;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Every Birth\nMatters',
    subtitle: 'Track deliveries, build streaks, and celebrate your career milestones',
    icon: 'heart',
    gradient: ['#643872', '#9B7EBD'],
    decorations: [
      { icon: 'sparkles', size: 24, top: 80, left: 30, rotation: -15, opacity: 0.6 },
      { icon: 'star', size: 18, top: 120, right: 40, rotation: 20, opacity: 0.5 },
      { icon: 'heart', size: 20, bottom: 180, left: 50, rotation: 10, opacity: 0.4 },
      { icon: 'sparkles', size: 16, bottom: 220, right: 60, rotation: -25, opacity: 0.5 },
    ],
  },
  {
    id: 'track',
    title: 'Log Births\nin Seconds',
    subtitle: 'One-tap delivery tracking designed for busy L&D shifts',
    icon: 'add-circle',
    gradient: ['#2563EB', '#60A5FA'],
    decorations: [
      { icon: 'male', size: 22, top: 90, left: 40, rotation: -10, opacity: 0.5 },
      { icon: 'female', size: 22, top: 130, right: 50, rotation: 15, opacity: 0.5 },
      { icon: 'time', size: 18, bottom: 200, left: 35, rotation: -5, opacity: 0.4 },
      { icon: 'calendar', size: 16, bottom: 170, right: 45, rotation: 20, opacity: 0.4 },
    ],
  },
  {
    id: 'achievements',
    title: 'Build Your\nStreak',
    subtitle: 'Weekly goals that fit your schedule — shields protect your progress',
    icon: 'trophy',
    gradient: ['#F59E0B', '#FCD34D'],
    decorations: [
      { icon: 'ribbon', size: 24, top: 85, left: 45, rotation: -20, opacity: 0.6 },
      { icon: 'medal', size: 20, top: 140, right: 35, rotation: 25, opacity: 0.5 },
      { icon: 'star', size: 18, bottom: 190, left: 55, rotation: 10, opacity: 0.5 },
      { icon: 'flame', size: 16, bottom: 230, right: 50, rotation: -15, opacity: 0.4 },
    ],
  },
  {
    id: 'setup',
    title: 'Quick Setup',
    subtitle: 'Personalize your experience in just a few taps',
    icon: 'person-circle',
    gradient: ['#10B981', '#6EE7B7'],
    decorations: [
      { icon: 'settings', size: 20, top: 95, left: 35, rotation: 15, opacity: 0.5 },
      { icon: 'brush', size: 18, top: 145, right: 45, rotation: -20, opacity: 0.4 },
      { icon: 'color-palette', size: 16, bottom: 185, left: 60, rotation: 25, opacity: 0.4 },
      { icon: 'construct', size: 18, bottom: 225, right: 40, rotation: -10, opacity: 0.5 },
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentPage, setCurrentPage] = useState(0);
  
  // Setup form state
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [shift, setShift] = useState('day');
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');

  // Get current step's gradient color for buttons
  const currentStepColor = ONBOARDING_STEPS[currentPage].gradient[0];


  const handleDone = async () => {
    await saveUserPreferences({
      name: name.trim() || undefined,
      unit: unit.trim() || undefined,
      shift: shift as 'day' | 'night' | 'rotating',
      tutorialCompleted: true,
      theme: 'system',
    });
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  }, []);

  const goToPage = (pageIndex: number) => {
    scrollViewRef.current?.scrollTo({ x: pageIndex * SCREEN_WIDTH, animated: true });
  };

  const handleNext = () => {
    if (currentPage < ONBOARDING_STEPS.length - 1) {
      goToPage(currentPage + 1);
    } else {
      handleDone();
    }
  };

  const handleSkip = () => {
    goToPage(ONBOARDING_STEPS.length - 1);
  };

  const renderDecorations = (step: OnboardingStep, pageIndex: number) => {
    const inputRange = [
      (pageIndex - 1) * SCREEN_WIDTH,
      pageIndex * SCREEN_WIDTH,
      (pageIndex + 1) * SCREEN_WIDTH,
    ];

    return step.decorations.map((decoration, index) => {
      const translateX = scrollX.interpolate({
        inputRange,
        outputRange: [-50, 0, 50],
        extrapolate: 'clamp',
      });

      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0, decoration.opacity, 0],
        extrapolate: 'clamp',
      });

      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.5, 1, 0.5],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          key={`decoration-${index}`}
          style={[
            styles.decoration,
            {
              top: decoration.top,
              bottom: decoration.bottom,
              left: decoration.left,
              right: decoration.right,
              transform: [
                { translateX },
                { rotate: `${decoration.rotation}deg` },
                { scale },
              ],
              opacity,
            },
          ]}
        >
          <Ionicons name={decoration.icon} size={decoration.size} color="white" />
        </Animated.View>
      );
    });
  };

  const renderMainIcon = (step: OnboardingStep, pageIndex: number) => {
    const inputRange = [
      (pageIndex - 1) * SCREEN_WIDTH,
      pageIndex * SCREEN_WIDTH,
      (pageIndex + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    const rotate = scrollX.interpolate({
      inputRange,
      outputRange: ['-15deg', '0deg', '15deg'],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale }, { rotate }],
            opacity,
          },
        ]}
      >
        <View style={styles.iconInner}>
          <Ionicons name={step.icon} size={64} color="white" />
        </View>
      </Animated.View>
    );
  };

  const renderSetupPage = (step: OnboardingStep, index: number) => {
    return (
      <View key={step.id} style={styles.page}>
        {/* Compact gradient header */}
        <LinearGradient
          colors={step.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.setupHeader, { paddingTop: insets.top + Spacing.md }]}
        >
          {/* Compact icon and title */}
          <View style={styles.setupHeaderContent}>
            <View style={styles.setupIconContainer}>
              <Ionicons name={step.icon} size={32} color="white" />
            </View>
            <View style={styles.setupHeaderText}>
              <ThemedText style={styles.setupTitle}>{step.title}</ThemedText>
              <ThemedText style={styles.setupSubtitle}>{step.subtitle}</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Form card */}
        <View style={[styles.setupFormCard, { backgroundColor: surfaceColor }]}>
          <ScrollView 
            style={styles.setupFormScroll}
            contentContainerStyle={styles.setupFormScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              label="Your Name"
              placeholder="How should we call you?"
              value={name}
              onChangeText={setName}
              leftIcon="person-outline"
            />
            
            <TextInput
              label="Unit / Department"
              placeholder="Where do you work?"
              value={unit}
              onChangeText={setUnit}
              leftIcon="business-outline"
            />
            
            <View style={styles.shiftContainer}>
              <ThemedText style={[styles.shiftLabel, { color: textSecondaryColor }]}>
                Shift Preference
              </ThemedText>
              <ThemedSegmentedButtons
                value={shift}
                onValueChange={setShift}
                buttons={[
                  { value: 'day', label: 'Day' },
                  { value: 'night', label: 'Night' },
                  { value: 'rotating', label: 'Rotating' },
                ]}
              />
            </View>
            
            <ThemedText style={[styles.optionalHint, { color: textSecondaryColor }]}>
              All fields are optional — you can update these anytime in Settings
            </ThemedText>
          </ScrollView>

          {/* Buttons integrated into form card */}
          <View style={[styles.setupButtonContainer, { paddingBottom: insets.bottom + Spacing.md }]}>
            <Pressable
              onPress={() => goToPage(currentPage - 1)}
              style={({ pressed }) => [
                styles.backButtonCustom,
                { 
                  backgroundColor: surfaceColor,
                  borderColor: currentStepColor + '40',
                },
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={currentStepColor} />
              <ThemedText style={[styles.backButtonText, { color: currentStepColor }]}>
                Back
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleDone}
              style={({ pressed }) => [
                styles.nextButtonCustom,
                { backgroundColor: currentStepColor },
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.nextButtonText}>Let's Go!</ThemedText>
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderPage = (step: OnboardingStep, index: number) => {
    // Use special layout for setup page
    if (step.id === 'setup') {
      return renderSetupPage(step, index);
    }

    return (
      <View key={step.id} style={styles.page}>
        <LinearGradient
          colors={step.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          {/* Floating decorations */}
          {renderDecorations(step, index)}
          
          {/* Main content */}
          <View style={[styles.contentContainer, { paddingTop: insets.top + 60 }]}>
            {/* Icon */}
            {renderMainIcon(step, index)}
            
            {/* Text */}
            <View style={styles.textContainer}>
              <ThemedText style={styles.title}>{step.title}</ThemedText>
              <ThemedText style={styles.subtitle}>{step.subtitle}</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderPageIndicators = () => (
    <View style={styles.indicatorContainer}>
      {ONBOARDING_STEPS.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const width = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={`indicator-${index}`}
            style={[
              styles.indicator,
              {
                width,
                opacity,
                backgroundColor: currentPage === ONBOARDING_STEPS.length - 1 ? primaryColor : 'white',
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Skip button */}
      {currentPage < ONBOARDING_STEPS.length - 1 && (
        <Pressable
          onPress={handleSkip}
          style={[styles.skipButton, { top: insets.top + Spacing.md }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ThemedText style={styles.skipText}>Skip</ThemedText>
        </Pressable>
      )}

      {/* Pages */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        bounces={false}
      >
        {ONBOARDING_STEPS.map((step, index) => renderPage(step, index))}
      </Animated.ScrollView>

      {/* Bottom section - hidden on setup page since buttons are in form */}
      {currentPage < ONBOARDING_STEPS.length - 1 && (
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + Spacing.lg }]}>
          {/* Page indicators */}
          {renderPageIndicators()}

          {/* Next button */}
          <View style={styles.buttonContainer}>
            {currentPage > 0 && (
              <Pressable
                onPress={() => goToPage(currentPage - 1)}
                style={({ pressed }) => [
                  styles.backButtonCustom,
                  { 
                    backgroundColor: surfaceColor,
                    borderColor: currentStepColor + '40',
                  },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Ionicons name="arrow-back" size={20} color={currentStepColor} />
                <ThemedText style={[styles.backButtonText, { color: currentStepColor }]}>
                  Back
                </ThemedText>
              </Pressable>
            )}
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButtonCustom,
                { backgroundColor: currentStepColor },
                currentPage === 0 && styles.nextButtonFullWidth,
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.nextButtonText}>Next</ThemedText>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    position: 'relative',
  },
  decoration: {
    position: 'absolute',
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  iconInner: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: Typography['4xl'],
    fontWeight: Typography.weights.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeights['4xl'],
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: Typography.lineHeights.lg,
    maxWidth: 300,
  },
  // Setup page styles
  setupHeader: {
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  setupHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  setupIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  setupHeaderText: {
    flex: 1,
  },
  setupTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.bold,
    color: 'white',
    marginBottom: Spacing.xs,
  },
  setupSubtitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: Typography.lineHeights.sm,
  },
  setupFormCard: {
    flex: 1,
    marginTop: -BorderRadius.xxl,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  setupFormScroll: {
    flex: 1,
  },
  setupFormScrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  setupButtonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  shiftContainer: {
    marginBottom: Spacing.md,
  },
  shiftLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
    letterSpacing: Typography.letterSpacing.wide,
  },
  optionalHint: {
    fontSize: Typography.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  skipButton: {
    position: 'absolute',
    right: Spacing.lg,
    zIndex: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
  },
  skipText: {
    color: 'white',
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  indicator: {
    height: 8,
    borderRadius: BorderRadius.full,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  backButtonCustom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
  },
  nextButtonCustom: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  nextButtonText: {
    color: 'white',
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
