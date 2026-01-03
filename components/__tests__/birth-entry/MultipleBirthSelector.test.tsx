import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MultipleBirthSelector } from '../../birth-entry/MultipleBirthSelector';

// Mock the hooks
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn().mockReturnValue('#000000'),
}));

describe('MultipleBirthSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    expect(getByText('1 Baby')).toBeTruthy();
  });

  it('should render all baby count buttons', () => {
    const { getByText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    expect(getByText('1 Baby')).toBeTruthy();
    expect(getByText('2 Babies')).toBeTruthy();
    expect(getByText('3 Babies')).toBeTruthy();
    expect(getByText('4 Babies')).toBeTruthy();
    expect(getByText('More than 4!')).toBeTruthy();
  });

  it('should call onChange with 1 when 1 Baby button is pressed', () => {
    const { getByText } = render(
      <MultipleBirthSelector value={2} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('1 Baby'));

    expect(mockOnChange).toHaveBeenCalledWith(1);
  });

  it('should call onChange with 2 when 2 Babies button is pressed', () => {
    const { getByText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('2 Babies'));

    expect(mockOnChange).toHaveBeenCalledWith(2);
  });

  it('should call onChange with 3 when 3 Babies button is pressed', () => {
    const { getByText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('3 Babies'));

    expect(mockOnChange).toHaveBeenCalledWith(3);
  });

  it('should call onChange with 4 when 4 Babies button is pressed', () => {
    const { getByText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('4 Babies'));

    expect(mockOnChange).toHaveBeenCalledWith(4);
  });

  it('should call onChange exactly once per button press', () => {
    const { getByText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('2 Babies'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should open modal when More than 4 button is pressed', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('More than 4!'));

    await waitFor(() => {
      expect(getByText('Enter number of babies')).toBeTruthy();
      expect(getByPlaceholderText('Enter a number greater than 4')).toBeTruthy();
    });
  });

  it('should show Cancel and Confirm buttons in modal', async () => {
    const { getByText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('More than 4!'));

    await waitFor(() => {
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Confirm')).toBeTruthy();
    });
  });

  it('should close modal when Cancel is pressed', async () => {
    const { getByText, queryByText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('More than 4!'));

    await waitFor(() => {
      expect(getByText('Enter number of babies')).toBeTruthy();
    });

    fireEvent.press(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Enter number of babies')).toBeNull();
    });
  });

  it('should call onChange with custom number when valid input is confirmed', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('More than 4!'));

    await waitFor(() => {
      expect(getByPlaceholderText('Enter a number greater than 4')).toBeTruthy();
    });

    const input = getByPlaceholderText('Enter a number greater than 4');
    fireEvent.changeText(input, '6');
    fireEvent.press(getByText('Confirm'));

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(6);
    });
  });

  it('should not call onChange if custom number is not greater than 4', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('More than 4!'));

    await waitFor(() => {
      expect(getByPlaceholderText('Enter a number greater than 4')).toBeTruthy();
    });

    const input = getByPlaceholderText('Enter a number greater than 4');
    fireEvent.changeText(input, '3');
    fireEvent.press(getByText('Confirm'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should not call onChange if custom number is empty', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('More than 4!'));

    await waitFor(() => {
      expect(getByPlaceholderText('Enter a number greater than 4')).toBeTruthy();
    });

    fireEvent.press(getByText('Confirm'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should close modal after successful custom number submission', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <MultipleBirthSelector value={1} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('More than 4!'));

    await waitFor(() => {
      expect(getByPlaceholderText('Enter a number greater than 4')).toBeTruthy();
    });

    const input = getByPlaceholderText('Enter a number greater than 4');
    fireEvent.changeText(input, '5');
    fireEvent.press(getByText('Confirm'));

    await waitFor(() => {
      expect(queryByText('Enter number of babies')).toBeNull();
    });
  });

  it('should handle value greater than 4 being selected', () => {
    const { getByText } = render(
      <MultipleBirthSelector value={7} onChange={mockOnChange} />
    );

    // More than 4 button should exist
    expect(getByText('More than 4!')).toBeTruthy();
  });

  it('should allow pressing the same number button that is already selected', () => {
    const { getByText } = render(
      <MultipleBirthSelector value={2} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('2 Babies'));

    expect(mockOnChange).toHaveBeenCalledWith(2);
  });
});
