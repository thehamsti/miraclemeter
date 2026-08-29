import type { BirthEventType } from '@/types';

const EVENT_TYPE_LABELS: Record<BirthEventType, string> = {
  delivery: 'Delivery',
  transition: 'Transition',
  'charge-nurse': 'Charge Nurse',
};

export function getEventTypeLabel(eventType?: BirthEventType): string {
  return eventType ? EVENT_TYPE_LABELS[eventType] : 'Unknown';
}
