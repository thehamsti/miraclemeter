import { getEventTypeLabel } from '../eventTypes';

describe('event type labels', () => {
  it('formats the charge nurse event type for saved records', () => {
    expect(getEventTypeLabel('charge-nurse')).toBe('Charge Nurse');
  });

  it('keeps legacy event type labels unchanged', () => {
    expect(getEventTypeLabel('delivery')).toBe('Delivery');
    expect(getEventTypeLabel('transition')).toBe('Transition');
  });
});
