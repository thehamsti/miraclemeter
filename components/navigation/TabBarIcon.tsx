// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps } from 'react';
import { type ColorValue, StyleSheet, View } from 'react-native';

export function TabBarIcon({ name, color }: { name: ComponentProps<typeof Ionicons>['name']; color: ColorValue }) {
  return (
    <View style={styles.container}>
      <Ionicons testID="tab-bar-icon" size={24} name={name} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
});
