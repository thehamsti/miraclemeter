import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Achievement, UserAchievements } from '../types';
import { getAchievementProgress } from '../services/achievements';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/Colors';

interface AchievementBadgeProps {
  achievement: Achievement;
  userAchievements: UserAchievements;
  size?: 'small' | 'large';
}

export const AchievementBadge = ({ 
  achievement, 
  userAchievements,
  size = 'large' 
}: AchievementBadgeProps) => {
  const primaryColor = useThemeColor({}, 'primary');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryLightColor = useThemeColor({}, 'primaryLight');
  
  const isUnlocked = userAchievements.unlocked.includes(achievement.id);
  const progress = getAchievementProgress(userAchievements, achievement.id);
  const currentProgress = userAchievements.progress[achievement.id] || 0;
  
  const iconSize = size === 'small' ? 32 : 40;
  const cardStyle = size === 'small' ? styles.smallCard : styles.largeCard;
  
  const accessibilityLabel = isUnlocked
    ? `${achievement.name}, unlocked. ${achievement.description}`
    : `${achievement.name}, locked. Progress: ${currentProgress} of ${achievement.requirement.value}. ${achievement.description}`;

  return (
    <Pressable
      style={[
        styles.card,
        cardStyle,
        isUnlocked ? styles.unlocked : styles.locked,
        { backgroundColor: isUnlocked ? primaryLightColor : surfaceColor }
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !isUnlocked }}
    >
      <View style={styles.content}>
        <View style={[
          styles.iconContainer,
          { 
            backgroundColor: isUnlocked 
              ? primaryColor 
              : textSecondaryColor + '20'
          }
        ]}>
          <MaterialCommunityIcons
            name={achievement.icon as any}
            size={iconSize}
            color={isUnlocked ? 'white' : textSecondaryColor}
          />
          {!isUnlocked && progress > 0 && achievement.requirement.value > 1 && (
            <View style={[
              styles.progressBadge,
              { backgroundColor: primaryColor }
            ]}>
              <ThemedText style={styles.progressBadgeText}>
                {currentProgress}
              </ThemedText>
            </View>
          )}
        </View>
        
        {size === 'large' && (
          <>
            <ThemedText 
              style={[
                styles.title,
                { color: isUnlocked ? textColor : textSecondaryColor }
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {achievement.name}
            </ThemedText>
            
            <ThemedText 
              style={[
                styles.description,
                { color: isUnlocked ? textColor : textSecondaryColor }
              ]}
              numberOfLines={3}
            >
              {achievement.description}
            </ThemedText>
            
            {!isUnlocked && progress > 0 && achievement.requirement.value > 1 && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBarBackground, { backgroundColor: textSecondaryColor + '20' }]}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        backgroundColor: primaryColor,
                        width: `${progress * 100}%`
                      }
                    ]} 
                  />
                </View>
                <ThemedText style={[styles.progressText, { color: textSecondaryColor }]}>
                  {currentProgress} / {achievement.requirement.value}
                </ThemedText>
              </View>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  smallCard: {
    margin: 4,
    width: 64,
    height: 64,
  },
  largeCard: {
    margin: 8,
    height: 180,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: Spacing.md,
    width: '100%',
    flex: 1,
  },
  iconContainer: {
    borderRadius: 50,
    padding: 8,
    marginBottom: 12,
    position: 'relative',
  },
  title: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    marginBottom: 4,
    width: '100%',
    paddingHorizontal: 8,
    lineHeight: Typography.sm * 1.2,
  },
  description: {
    fontSize: Typography.xs,
    textAlign: 'center',
    opacity: 0.8,
    width: '100%',
    paddingHorizontal: 8,
    lineHeight: Typography.xs * 1.4,
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.xs,
    fontWeight: Typography.weights.medium,
  },
  unlocked: {
    elevation: 2,
  },
  locked: {
    opacity: 0.7,
  },
  progressBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  progressBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    lineHeight: 12,
  },
});