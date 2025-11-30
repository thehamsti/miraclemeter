import { useRef } from 'react';
import { Animated } from 'react-native';

interface UsePressAnimationOptions {
  scale?: number;
}

interface UsePressAnimationReturn {
  scaleAnim: Animated.Value;
  handlePressIn: () => void;
  handlePressOut: () => void;
}

export function usePressAnimation(options: UsePressAnimationOptions = {}): UsePressAnimationReturn {
  const { scale = 0.95 } = options;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return {
    scaleAnim,
    handlePressIn,
    handlePressOut,
  };
}
