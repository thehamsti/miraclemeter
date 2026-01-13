// This is a placeholder tab that redirects to the quick-entry modal
// The actual navigation is handled by the tab button in _layout.tsx
import { Redirect } from 'expo-router';

export default function QuickEntryPlaceholder() {
  return <Redirect href="/quick-entry" />;
}
