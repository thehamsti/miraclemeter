import React from 'react';
import { StyleSheet, Modal, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Href } from 'expo-router';

interface MenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export function Menu({ isVisible, onClose }: MenuProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const insets = useSafeAreaInsets();

  const MenuItem = ({ icon, label, href }: { icon: string; label: string; href: Href<string | object> }) => (
    <Link href={href} asChild onPress={onClose}>
      <Pressable style={styles.menuItem}>
        <Ionicons name={icon as any} size={24} color={textColor} />
        <ThemedText style={styles.menuItemText}>{label}</ThemedText>
      </Pressable>
    </Link>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <ThemedView 
          style={[
            styles.menuContainer, 
            { 
              backgroundColor,
              top: insets.top + 56
            }
          ]}
        >
          <MenuItem 
            icon="settings-outline" 
            label="Settings" 
            href="/settings" 
          />
          <MenuItem 
            icon="heart-outline" 
            label="Support the Developer" 
            href="/support" 
          />
          <MenuItem 
            icon="chatbox-outline" 
            label="Feedback" 
            href="/feedback" 
          />
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    right: 16,
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
}); 