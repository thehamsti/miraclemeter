import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Button } from './Button';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius, Typography } from '@/constants/Colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to analytics service
    // Analytics.recordError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback onRetry={this.handleRetry} error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onRetry: () => void;
  error?: Error;
}

function ErrorFallback({ onRetry, error }: ErrorFallbackProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const errorColor = useThemeColor({}, 'error');
  const shadowColor = useThemeColor({}, 'shadowColor');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.content, { backgroundColor: surfaceColor, shadowColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: errorColor + '15' }]}>
          <Ionicons name="warning-outline" size={64} color={errorColor} />
        </View>
        
        <ThemedText style={[styles.title, { color: textColor }]}>
          Something went wrong
        </ThemedText>
        
        <ThemedText style={[styles.message, { color: textSecondaryColor }]}>
          The app encountered an unexpected error. Your data is safe, and you can try again.
        </ThemedText>

        {__DEV__ && error && (
          <View style={[styles.errorDetails, { backgroundColor: backgroundColor, borderColor }]}>
            <ThemedText style={[styles.errorText, { color: textSecondaryColor }]}>
              {error.toString()}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.actions}>
          <Button
            title="Try Again"
            onPress={onRetry}
            style={styles.retryButton}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.base,
    marginBottom: Spacing.lg,
  },
  errorDetails: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  errorText: {
    fontSize: Typography.sm,
    fontFamily: 'monospace',
    textAlign: 'left',
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
  },
  retryButton: {
    flex: 1,
  },
});

export default ErrorBoundary;