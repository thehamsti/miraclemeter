import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BabyDetailsForm } from '../../birth-entry/BabyDetailsForm';
import type { Baby } from '@/types';

// Mock the hooks
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn().mockReturnValue('#000000'),
}));

describe('BabyDetailsForm', () => {
  const defaultBaby: Baby = {
    gender: 'boy',
    birthOrder: 1,
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByText } = render(
      <BabyDetailsForm baby={defaultBaby} onUpdate={mockOnUpdate} />
    );

    expect(getByText('Baby 1')).toBeTruthy();
  });

  it('should display the correct birth order', () => {
    const baby: Baby = { gender: 'girl', birthOrder: 3 };

    const { getByText } = render(
      <BabyDetailsForm baby={baby} onUpdate={mockOnUpdate} />
    );

    expect(getByText('Baby 3')).toBeTruthy();
  });

  it('should render all three gender buttons', () => {
    const { getByText } = render(
      <BabyDetailsForm baby={defaultBaby} onUpdate={mockOnUpdate} />
    );

    expect(getByText('Boy')).toBeTruthy();
    expect(getByText('Girl')).toBeTruthy();
    expect(getByText('Angel')).toBeTruthy();
  });

  it('should call onUpdate with boy gender when Boy button is pressed', () => {
    const baby: Baby = { gender: 'girl', birthOrder: 1 };

    const { getByText } = render(
      <BabyDetailsForm baby={baby} onUpdate={mockOnUpdate} />
    );

    fireEvent.press(getByText('Boy'));

    expect(mockOnUpdate).toHaveBeenCalledWith({
      gender: 'boy',
      birthOrder: 1,
    });
  });

  it('should call onUpdate with girl gender when Girl button is pressed', () => {
    const baby: Baby = { gender: 'boy', birthOrder: 1 };

    const { getByText } = render(
      <BabyDetailsForm baby={baby} onUpdate={mockOnUpdate} />
    );

    fireEvent.press(getByText('Girl'));

    expect(mockOnUpdate).toHaveBeenCalledWith({
      gender: 'girl',
      birthOrder: 1,
    });
  });

  it('should call onUpdate with angel gender when Angel button is pressed', () => {
    const baby: Baby = { gender: 'boy', birthOrder: 1 };

    const { getByText } = render(
      <BabyDetailsForm baby={baby} onUpdate={mockOnUpdate} />
    );

    fireEvent.press(getByText('Angel'));

    expect(mockOnUpdate).toHaveBeenCalledWith({
      gender: 'angel',
      birthOrder: 1,
    });
  });

  it('should preserve birth order when updating gender', () => {
    const baby: Baby = { gender: 'boy', birthOrder: 5 };

    const { getByText } = render(
      <BabyDetailsForm baby={baby} onUpdate={mockOnUpdate} />
    );

    fireEvent.press(getByText('Girl'));

    expect(mockOnUpdate).toHaveBeenCalledWith({
      gender: 'girl',
      birthOrder: 5,
    });
  });

  it('should handle different birth orders', () => {
    const birthOrders = [1, 2, 3, 4, 5];

    birthOrders.forEach((birthOrder) => {
      const baby: Baby = { gender: 'boy', birthOrder };

      const { getByText } = render(
        <BabyDetailsForm baby={baby} onUpdate={mockOnUpdate} />
      );

      expect(getByText(`Baby ${birthOrder}`)).toBeTruthy();
    });
  });

  it('should call onUpdate exactly once per button press', () => {
    const { getByText } = render(
      <BabyDetailsForm baby={defaultBaby} onUpdate={mockOnUpdate} />
    );

    fireEvent.press(getByText('Girl'));

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
  });

  it('should allow pressing the same gender button that is already selected', () => {
    const baby: Baby = { gender: 'boy', birthOrder: 1 };

    const { getByText } = render(
      <BabyDetailsForm baby={baby} onUpdate={mockOnUpdate} />
    );

    fireEvent.press(getByText('Boy'));

    expect(mockOnUpdate).toHaveBeenCalledWith({
      gender: 'boy',
      birthOrder: 1,
    });
  });
});
