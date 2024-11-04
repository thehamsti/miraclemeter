import { render, screen } from '@testing-library/react-native';
import * as React from 'react';
import TabLayout from '../_layout';

// Mock the required dependencies
jest.mock('expo-router', () => ({
  Tabs: {
    Screen: jest.fn().mockImplementation(({ children }) => children),
    Navigator: jest.fn().mockImplementation(({ children }) => children),
  },
}));

jest.mock('@/components/navigation/TabBarIcon', () => ({
  TabBarIcon: jest.fn().mockImplementation(() => null),
}));

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn().mockReturnValue('light'),
}));

describe('TabLayout', () => {
  it('renders all tab screens', () => {
    render(<TabLayout />);
    
    // Verify that all tab titles are present
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Quick Entry')).toBeTruthy();
    expect(screen.getByText('History')).toBeTruthy();
  });

  it('uses correct icons for each tab', () => {
    render(<TabLayout />);
    
    // You can add more specific tests for TabBarIcon props if needed
    const tabBarIcons = screen.getAllByTestId('tab-bar-icon');
    expect(tabBarIcons).toHaveLength(3); // 3 visible tabs
  });
}); 