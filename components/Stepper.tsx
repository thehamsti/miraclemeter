import { StyleSheet, Dimensions } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <ThemedView
            key={index}
            style={[
              styles.step,
              index <= currentStep ? styles.activeStep : styles.inactiveStep,
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
  activeStep: {
    backgroundColor: '#007AFF',
  },
  inactiveStep: {
    backgroundColor: '#E0E0E0',
  },
  stepText: {
    textAlign: 'center',
    fontSize: 14,
  },
}); 