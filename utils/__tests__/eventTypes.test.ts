import {
  DEFAULT_ENABLED_EVENT_TYPES,
  getEnabledEventTypes,
  getEventTypeLabel,
} from '../eventTypes';

describe('event type labels', () => {
  it('formats the charge nurse event type for saved records', () => {
    expect(getEventTypeLabel('charge-nurse')).toBe('Charge Nurse');
  });

  it('keeps legacy event type labels unchanged', () => {
    expect(getEventTypeLabel('delivery')).toBe('Delivery');
    expect(getEventTypeLabel('transition')).toBe('Transition');
  });

  it('defaults every event type to enabled', () => {
    expect(getEnabledEventTypes()).toEqual(DEFAULT_ENABLED_EVENT_TYPES);
  });

  it('overrides only the saved event type settings', () => {
    expect(getEnabledEventTypes({ enabledEventTypes: { 'charge-nurse': false } })).toEqual({
      delivery: true,
      transition: true,
      'charge-nurse': false,
    });
  });
});
