import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Achievement } from '../types';
import { useTheme } from '../hooks/ThemeContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';

interface AchievementNotificationProps {
  achievement: Achievement;
  visible: boolean;
  onDismiss: () => void;
}

export const AchievementNotification = ({ 
  achievement, 
  visible, 
  onDismiss 
}: AchievementNotificationProps) => {
  const { effectiveTheme } = useTheme();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const translateY = React.useRef(new Animated.Value(-200)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable
        style={[
          styles.card,
          { backgroundColor: primaryColor }
        ]}
        onPress={handleDismiss}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="trophy"
              size={24}
              color="white"
            />
            <ThemedText
              style={[styles.title, { color: 'white' }]}
            >
              Achievement Unlocked!
            </ThemedText>
          </View>
          
          <View style={styles.achievementInfo}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
              ]}
            >
              <MaterialCommunityIcons
                name={achievement.icon as any}
                size={32}
                color="white"
              />
            </View>
            
            <View style={styles.textContainer}>
              <ThemedText
                style={[styles.achievementName, { color: 'white' }]}
              >
                {achievement.name}
              </ThemedText>
              <ThemedText
                style={[styles.achievementDescription, { color: 'rgba(255, 255, 255, 0.9)' }]}
              >
                {achievement.description}
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  card: {
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
    elevation: 8,
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginLeft: 8,
    fontSize: Typography.lg,
    fontWeight: Typography.weights.bold,
  },
  achievementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 50,
    padding: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  achievementName: {
    fontSize: Typography.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: Typography.sm,
  },
});