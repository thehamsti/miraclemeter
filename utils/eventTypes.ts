import type { BirthEventType, UserPreferences } from '@/types';

export type EnabledEventTypes = Record<BirthEventType, boolean>;

export const DEFAULT_ENABLED_EVENT_TYPES = {
  delivery: true,
  transition: true,
  'charge-nurse': true,
} satisfies EnabledEventTypes;

const EVENT_TYPE_LABELS: Record<BirthEventType, string> = {
  delivery: 'Delivery',
  transition: 'Transition',
  'charge-nurse': 'Charge Nurse',
};

export function getEventTypeLabel(eventType?: BirthEventType): string {
  return eventType ? EVENT_TYPE_LABELS[eventType] : 'Unknown';
}

export function getEnabledEventTypes(
  preferences?: Pick<UserPreferences, 'enabledEventTypes'> | null,
): EnabledEventTypes {
  return {
    ...DEFAULT_ENABLED_EVENT_TYPES,
    ...preferences?.enabledEventTypes,
  };
}
