import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecordCard } from '../RecordCard';
import type { BirthRecord } from '@/types';

// Mock all React Native animated components
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    timing: () => ({
      start: (callback?: () => void) => callback && callback(),
    }),
    spring: () => ({
      start: (callback?: () => void) => callback && callback(),
    }),
    Value: class {
      constructor(val: number) {
        return {
          setValue: jest.fn(),
          interpolate: () => val,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        };
      }
    },
  };
});

// Mock the hooks
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn().mockReturnValue('#000000'),
  useShadowOpacity: jest.fn().mockReturnValue(0.1),
}));

jest.mock('@/hooks/usePressAnimation', () => ({
  usePressAnimation: jest.fn().mockReturnValue({
    scaleAnim: { interpolate: () => 1 },
    handlePressIn: jest.fn(),
    handlePressOut: jest.fn(),
  }),
}));

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock dateUtils
jest.mock('@/utils/dateUtils', () => ({
  formatDistanceToNow: jest.fn().mockReturnValue('5 minutes ago'),
}));

describe('RecordCard', () => {
  const mockRecord: BirthRecord = {
    id: 'test-id-1',
    timestamp: new Date('2024-01-15T10:30:00'),
    deliveryType: 'vaginal',
    eventType: 'delivery',
    babies: [{ gender: 'boy', birthOrder: 1 }],
    notes: 'Test notes',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('placeholder state', () => {
    it('should render placeholder when no record is provided', () => {
      const { getByText } = render(<RecordCard />);

      expect(getByText('No data available')).toBeTruthy();
    });

    it('should render custom placeholder text', () => {
      const { getByText } = render(
        <RecordCard placeholder="No records yet" />
      );

      expect(getByText('No records yet')).toBeTruthy();
    });
  });

  describe('record display', () => {
    it('should render record with date', () => {
      const { getByText } = render(<RecordCard record={mockRecord} />);

      expect(getByText(/Jan/)).toBeTruthy();
    });

    it('should display time ago', () => {
      const { getByText } = render(<RecordCard record={mockRecord} />);

      expect(getByText('5 minutes ago')).toBeTruthy();
    });

    it('should display vaginal delivery type', () => {
      const { getByText } = render(<RecordCard record={mockRecord} />);

      expect(getByText('Vaginal')).toBeTruthy();
    });

    it('should display c-section delivery type', () => {
      const cSectionRecord = { ...mockRecord, deliveryType: 'c-section' as const };

      const { getByText } = render(<RecordCard record={cSectionRecord} />);

      expect(getByText('C-Section')).toBeTruthy();
    });

    it('should display single birth text for one baby', () => {
      const { getByText } = render(<RecordCard record={mockRecord} />);

      expect(getByText('Single Birth')).toBeTruthy();
    });

    it('should display multiple babies count', () => {
      const twinRecord: BirthRecord = {
        ...mockRecord,
        babies: [
          { gender: 'boy', birthOrder: 1 },
          { gender: 'girl', birthOrder: 2 },
        ],
      };

      const { getByText } = render(<RecordCard record={twinRecord} />);

      expect(getByText('2 Babies')).toBeTruthy();
    });

    it('should display baby chips with birth order', () => {
      const { getByText } = render(<RecordCard record={mockRecord} />);

      expect(getByText('Baby 1')).toBeTruthy();
    });

    it('should display notes when present', () => {
      const { getByText } = render(<RecordCard record={mockRecord} />);

      expect(getByText('Test notes')).toBeTruthy();
    });

    it('should not display notes section when notes are empty', () => {
      const noNotesRecord = { ...mockRecord, notes: undefined };

      const { queryByText } = render(<RecordCard record={noNotesRecord} />);

      expect(queryByText('Test notes')).toBeNull();
    });
  });

  describe('date handling', () => {
    it('should handle record without timestamp', () => {
      const noTimestampRecord = { ...mockRecord, timestamp: undefined };

      const { getByText } = render(<RecordCard record={noTimestampRecord} />);

      expect(getByText('Unknown Date')).toBeTruthy();
    });

    it('should display time unknown for invalid timestamp', () => {
      const noTimestampRecord = { ...mockRecord, timestamp: undefined };

      const { getByText } = render(<RecordCard record={noTimestampRecord} />);

      expect(getByText('Time unknown')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when provided and pressed', () => {
      const mockOnPress = jest.fn();

      const { getAllByRole } = render(
        <RecordCard record={mockRecord} onPress={mockOnPress} />
      );

      // Get the first button (main card pressable)
      const buttons = getAllByRole('button');
      fireEvent.press(buttons[0]);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should navigate to edit screen when pressed without onPress', () => {
      const { getAllByRole } = render(
        <RecordCard record={mockRecord} showActions={true} />
      );

      // Get the first button (main card pressable)
      const buttons = getAllByRole('button');
      fireEvent.press(buttons[0]);

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/edit',
        params: { id: 'test-id-1' },
      });
    });
  });

  describe('baby genders', () => {
    it('should render multiple baby chips', () => {
      const tripletRecord: BirthRecord = {
        ...mockRecord,
        babies: [
          { gender: 'boy', birthOrder: 1 },
          { gender: 'girl', birthOrder: 2 },
          { gender: 'angel', birthOrder: 3 },
        ],
      };

      const { getByText } = render(<RecordCard record={tripletRecord} />);

      expect(getByText('Baby 1')).toBeTruthy();
      expect(getByText('Baby 2')).toBeTruthy();
      expect(getByText('Baby 3')).toBeTruthy();
    });

    it('should handle baby with birthOrder 0', () => {
      const noBirthOrderRecord = {
        ...mockRecord,
        babies: [{ gender: 'boy' as const, birthOrder: 0 }],
      };

      const { getByText } = render(<RecordCard record={noBirthOrderRecord} />);

      expect(getByText('Baby')).toBeTruthy();
    });
  });
});
