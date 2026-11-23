/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BayDashboardCountdown } from 'shared';
import { getCountdownDisplay, pickDisplayedCountdowns } from '../../utils/bay-dashboard-countdown.utils';

const countdown = (overrides: Partial<BayDashboardCountdown>): BayDashboardCountdown => ({
  bayDashboardCountdownId: overrides.name ?? 'id',
  name: 'FHE',
  startDate: new Date('2026-01-01'),
  isPrimary: false,
  ...overrides
});

// noon local time on April 1st 2026, so the day is the same whatever timezone the tests run in
const now = new Date(2026, 3, 1, 12);

describe('getCountdownDisplay', () => {
  it('counts down to the end date and fills the gauge by how much time has passed', () => {
    const display = getCountdownDisplay(
      countdown({ startDate: new Date('2026-03-01'), endDate: new Date('2026-05-01') }),
      now
    );

    expect(display.days).toBe(30);
    expect(display.label).toBe('Days Until FHE');
    expect(display.progress).toBeCloseTo(31 / 61);
  });

  it('uses Day when there is one day left', () => {
    const display = getCountdownDisplay(countdown({ endDate: new Date('2026-04-02') }), now);

    expect(display.days).toBe(1);
    expect(display.label).toBe('Day Until FHE');
  });

  it('switches to days since once the end date is reached', () => {
    const display = getCountdownDisplay(countdown({ endDate: new Date('2026-03-25') }), now);

    expect(display.days).toBe(7);
    expect(display.label).toBe('Days Since FHE');
    expect(display.progress).toBe(1);
  });

  it('shows 0 days since on the end date itself', () => {
    const display = getCountdownDisplay(countdown({ endDate: new Date('2026-04-01') }), now);

    expect(display.days).toBe(0);
    expect(display.label).toBe('Days Since FHE');
  });

  it('counts up from the start date when there is no end date', () => {
    const display = getCountdownDisplay(countdown({ name: 'Bay Cleaned', startDate: new Date('2026-03-20') }), now);

    expect(display.days).toBe(12);
    expect(display.label).toBe('Days Since Bay Cleaned');
    expect(display.progress).toBe(1);
  });

  it('does not repeat "Days Since" when the name already starts with it', () => {
    const display = getCountdownDisplay(
      countdown({ name: 'Days Since Last Bay Clean Up', startDate: new Date('2026-03-20') }),
      now
    );

    expect(display.label).toBe('Days Since Last Bay Clean Up');
  });

  it('counts down to the start of a count up that has not started yet', () => {
    const display = getCountdownDisplay(countdown({ startDate: new Date('2026-04-11') }), now);

    expect(display.days).toBe(10);
    expect(display.label).toBe('Days Until FHE');
    expect(display.progress).toBe(0);
  });
});

describe('pickDisplayedCountdowns', () => {
  const fhe = countdown({ name: 'FHE', endDate: new Date('2026-05-01'), isPrimary: true });
  const fsae = countdown({ name: 'FSAE', endDate: new Date('2026-06-15') });
  const fsaeSooner = countdown({ name: 'FSAE Sooner', endDate: new Date('2026-04-20') });
  const bayCleaned = countdown({ name: 'Bay Cleaned', startDate: new Date('2026-03-20') });
  const ended = countdown({ name: 'Ended', endDate: new Date('2026-03-01') });

  it('puts the primary countdown in the gauge even when another ends sooner', () => {
    const { primary, secondary } = pickDisplayedCountdowns([fsaeSooner, fhe], now);

    expect(primary).toBe(fhe);
    expect(secondary).toBe(fsaeSooner);
  });

  it('puts the remaining countdown ending soonest in the badge', () => {
    expect(pickDisplayedCountdowns([bayCleaned, fsae, fhe, fsaeSooner], now).secondary).toBe(fsaeSooner);
  });

  it('puts countdowns without an upcoming end date in the badge last', () => {
    expect(pickDisplayedCountdowns([ended, bayCleaned, fhe, fsae], now).secondary).toBe(fsae);
  });

  it('falls back to the countdown ending soonest when none is primary', () => {
    const { primary, secondary } = pickDisplayedCountdowns([bayCleaned, fsae, fsaeSooner], now);

    expect(primary).toBe(fsaeSooner);
    expect(secondary).toBe(fsae);
  });

  it('shows only the gauge for a single countdown, and nothing for none', () => {
    expect(pickDisplayedCountdowns([bayCleaned], now)).toEqual({ primary: bayCleaned, secondary: undefined });
    expect(pickDisplayedCountdowns([], now)).toEqual({ primary: undefined, secondary: undefined });
  });
});
