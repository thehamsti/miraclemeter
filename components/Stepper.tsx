import { StyleSheet, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const inactiveColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.step,
              { backgroundColor: index <= currentStep ? primaryColor : inactiveColor },
            ]}
          />
        ))}
      </ThemedView>
      <ThemedText style={styles.stepText}>
        Step {currentStep + 1} of {totalSteps}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
  stepsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  stepText: {
    textAlign: 'center',
    fontSize: 14,
  },
}); 