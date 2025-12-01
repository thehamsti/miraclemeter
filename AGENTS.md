# AGENTS.md

## Commands
```bash
npm start                                      # Expo dev server
npm run ios                                    # iOS simulator
npm test                                       # Tests (watch mode)
npm test -- services/__tests__/storage.test.ts # Single test file
npm run lint                                   # ESLint
```

## Code Style
- **TypeScript**: Strict mode enabled. Use explicit types for function params/returns.
- **Imports**: Use `@/` path alias for project imports. External deps first, then local.
- **Exports**: Use `export type {}` for type-only exports at file end.
- **Functions**: Prefer `async function name()` syntax over arrow functions for exports.
- **Loops**: Prefer `for...of` over `.forEach()`.
- **Errors**: Wrap in custom Error classes (e.g., `StorageError`). Always `console.error` before throwing.
- **Theming**: Always use `useThemeColor({}, 'colorName')` hook for colors, never hardcode.
- **Components**: React Native Paper for UI. Functional components with hooks only.
- **Naming**: PascalCase for components/types, camelCase for functions/variables.
- **Data**: All storage via AsyncStorage in `services/storage.ts`. Types in `types.ts`.

## Onboarding / Immersive Screen Style
For full-screen immersive experiences (onboarding, splash, feature tours):
- **Gradients**: Use `expo-linear-gradient` with two-color gradients per step/section.
- **Animations**: Use `Animated` API with scroll-driven interpolations (`inputRange`/`outputRange`).
- **Decorations**: Floating icons with opacity, rotation, and scale animations for visual polish.
- **Layout**: Full-screen pages with `ScrollView` horizontal paging, not third-party carousel libraries.
- **Safe Areas**: Use `useSafeAreaInsets()` for proper padding on notched devices.
- **Icons**: Prefer `Ionicons` from `@expo/vector-icons` for consistency.
- **Buttons**: Custom `Pressable` components with gradient-derived colors, not Paper buttons.
