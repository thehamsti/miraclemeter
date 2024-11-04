// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import Ionicons from '@expo/vector-icons/Ionicons';
import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';

export function TabBarIcon({ name, color }: { name: ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons testID="tab-bar-icon" size={28} style={{ marginBottom: -3 }} name={name} color={color} />;
}
