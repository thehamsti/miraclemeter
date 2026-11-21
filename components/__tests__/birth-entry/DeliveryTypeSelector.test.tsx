import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeliveryTypeSelector } from '../../birth-entry/DeliveryTypeSelector';

// Mock the hooks
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn().mockReturnValue('#000000'),
}));

describe('DeliveryTypeSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="vaginal" onChange={mockOnChange} />
    );

    expect(getByText('Delivery Type')).toBeTruthy();
  });

  it('should render all three delivery type buttons', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="vaginal" onChange={mockOnChange} />
    );

    expect(getByText('Vaginal')).toBeTruthy();
    expect(getByText('C-Section')).toBeTruthy();
    expect(getByText('Unknown')).toBeTruthy();
  });

  it('should call onChange with vaginal when Vaginal button is pressed', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="c-section" onChange={mockOnChange} />
    );

    await fireEvent.press(getByText('Vaginal'));

    expect(mockOnChange).toHaveBeenCalledWith('vaginal');
  });

  it('should call onChange with c-section when C-Section button is pressed', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="vaginal" onChange={mockOnChange} />
    );

    await fireEvent.press(getByText('C-Section'));

    expect(mockOnChange).toHaveBeenCalledWith('c-section');
  });

  it('should call onChange with unknown when Unknown button is pressed', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="vaginal" onChange={mockOnChange} />
    );

    await fireEvent.press(getByText('Unknown'));

    expect(mockOnChange).toHaveBeenCalledWith('unknown');
  });

  it('should call onChange exactly once per button press', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="vaginal" onChange={mockOnChange} />
    );

    await fireEvent.press(getByText('C-Section'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should allow pressing the same type button that is already selected', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="vaginal" onChange={mockOnChange} />
    );

    await fireEvent.press(getByText('Vaginal'));

    expect(mockOnChange).toHaveBeenCalledWith('vaginal');
  });

  it('should render with vaginal as initial value', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="vaginal" onChange={mockOnChange} />
    );

    // Component should render without error
    expect(getByText('Vaginal')).toBeTruthy();
  });

  it('should render with c-section as initial value', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="c-section" onChange={mockOnChange} />
    );

    // Component should render without error
    expect(getByText('C-Section')).toBeTruthy();
  });

  it('should render with unknown as initial value', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="unknown" onChange={mockOnChange} />
    );

    // Component should render without error
    expect(getByText('Unknown')).toBeTruthy();
  });

  it('should display the header icon and text', async () => {
    const { getByText } = await render(
      <DeliveryTypeSelector value="vaginal" onChange={mockOnChange} />
    );

    expect(getByText('Delivery Type')).toBeTruthy();
  });
});
