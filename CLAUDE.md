# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MiracleMeter is a React Native mobile app for healthcare professionals to track births they've assisted with. Built with Expo managed workflow, TypeScript, and React Native Paper UI components.

## Commands

### Development
```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run tests
npm test

# Run linter
npm run lint

# Run a specific test file
npm test -- components/__tests__/ThemedText-test.tsx
```

### Building & Deployment
```bash
# Build iOS app locally
eas build --platform ios --profile production --local

# Submit to App Store
eas submit --platform ios
```

## Architecture

### Navigation Structure
Using Expo Router file-based routing:
- `app/(tabs)/` - Main tab navigation (Home, Quick Entry, History, Stats)
- `app/(auth)/` - Onboarding flow
- `app/settings.tsx`, `app/edit.tsx` - Modal screens

### Data Flow
- **Storage**: AsyncStorage for local persistence (no backend)
- **State**: Component-level state management, no global state library
- **Data Model**: Birth records stored as JSON array in AsyncStorage under key `birthRecords`

### Key Services
- `services/storage.ts` - Handles all AsyncStorage operations for birth records
- `utils/dateUtils.ts` - Date formatting and calculations
- `utils/notifications.ts` - Push notification management

### UI Components
- Custom themed components in `components/` extend React Native Paper
- Theme context in `hooks/ThemeContext.tsx` manages dark/light mode
- Consistent styling through `constants/Colors.ts` and `constants/Theme.ts`

## Important Conventions

### TypeScript
- Strict mode enabled
- Define types in `types.ts` for shared data models
- Use proper type annotations for all function parameters and returns

### Component Structure
- Functional components with hooks
- Extract reusable logic into custom hooks
- Keep components focused and single-purpose

### Testing
- Jest with React Native Testing Library
- Test files in `__tests__` directories next to components
- Focus on user interactions and rendered output

## iOS-Specific Considerations
- App is iOS-only (configured in app.config.ts)
- Uses iOS-specific UI patterns (e.g., DateTimePicker)
- Bundle identifier: `com.hamstico.miraclemeter`

## Memories
- When incrementing version you have to go to package.json package-lock.json app.config.ts and ios/miraclemeter/Info.plist