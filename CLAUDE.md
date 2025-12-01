# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MiracleMeter is a React Native mobile app for healthcare professionals to track births they've assisted with. Built with Expo managed workflow, TypeScript, and React Native Paper UI components. iOS-only app with local-first data storage.

## Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm test               # Run tests in watch mode
npm run lint           # Run ESLint

# Single test file
npm test -- components/__tests__/ThemedText-test.tsx

# Build & Deploy
eas build --platform ios --profile production --local
eas submit --platform ios
```

## Architecture

### Navigation (Expo Router)
- `app/(tabs)/` - Main tabs: Home (`index.tsx`), Quick Entry, History
- `app/(auth)/onboarding.tsx` - First-launch onboarding flow
- `app/*.tsx` - Modal screens: settings, edit, stats, about, feedback, achievements

### Data Layer
All data stored locally via AsyncStorage (no backend):
- `services/storage.ts` - Birth records CRUD, user preferences, onboarding state
- `services/achievements.ts` - Achievement tracking, progress calculation, streak logic
- Storage keys: `birth_records`, `user_preferences`, `onboarding_complete`, `userAchievements`

### Data Types (types.ts)
- `BirthRecord` - Core record with babies array, delivery type, timestamp
- `Baby` - Gender ('boy' | 'girl' | 'angel'), birth order
- `UserPreferences` - Name, theme, shift settings, notifications
- `Achievement` / `UserAchievements` - Gamification system

### Theme System
- `hooks/ThemeContext.tsx` - Theme provider wrapping app
- `hooks/useThemeColor.ts` - Hook to get themed colors
- `constants/Colors.ts` - Color definitions, spacing, typography, shadows
- React Native Paper (`PaperProvider`) for Material Design components

## Key Patterns

### Theming
Always use `useThemeColor` hook for colors:
```tsx
const backgroundColor = useThemeColor({}, 'background');
```

### Achievements Integration
`saveBirthRecord()` and `updateBirthRecord()` in storage.ts automatically call `checkAchievements()` and return newly unlocked achievement IDs.

### Birth Entry Components
- `components/birth-entry/` - Modular form components for birth data entry
- `DeliveryTypeSelector`, `MultipleBirthSelector`, `BabyDetailsForm`

## Version Bumping

When incrementing version, update ALL of these files:
- `package.json` (version field)
- `package-lock.json` (version field)
- `app.config.ts` (version field)
- `ios/miraclemeter/Info.plist` (CFBundleShortVersionString)

## Onboarding / Immersive Screen Style

For full-screen immersive experiences (onboarding flows, feature tours):

### Visual Design
- **Gradients**: `expo-linear-gradient` with two-color arrays per step (e.g., `['#643872', '#9B7EBD']`)
- **Decorations**: Floating icons with opacity, rotation, and position offsets for visual depth
- **Icons**: `Ionicons` from `@expo/vector-icons` (not MaterialCommunityIcons)

### Animation Patterns
- **Scroll-driven**: Use `Animated.ScrollView` with `Animated.event` for scroll position tracking
- **Interpolation**: Define `inputRange`/`outputRange` based on page widths for smooth transitions
- **Properties to animate**: scale, opacity, rotation, translateX for parallax effects

### Layout
- Horizontal `ScrollView` with `pagingEnabled` (no third-party carousel libs)
- `useSafeAreaInsets()` for proper padding on notched devices
- Page indicators using animated width/opacity based on scroll position

### Buttons
- Custom `Pressable` components styled with gradient-derived colors
- Include pressed state with opacity and scale transforms
- Use step-specific colors (e.g., `currentStepColor` from gradient[0])