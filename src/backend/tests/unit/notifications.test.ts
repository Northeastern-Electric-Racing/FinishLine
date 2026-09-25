import { describe, it, expect } from 'vitest';
import { Event_Reminder_Tier } from '@prisma/client';
import { getDueTier, getEventChannelIds } from '../../src/utils/notifications.utils';
import { HOUR_MS } from '../../src/prisma/dates';

type ReminderEvent = Parameters<typeof getEventChannelIds>[0];

const makeEvent = (eventTeamIds: (string | null)[], wpTeamIds: (string | null)[][]): ReminderEvent =>
  ({
    teams: eventTeamIds.map((slackId) => ({ slackId })),
    workPackages: wpTeamIds.map((ids) => ({ project: { teams: ids.map((slackId) => ({ slackId })) } }))
  }) as unknown as ReminderEvent;

describe('getEventChannelIds', () => {
  it('collects channels from event teams and work package project teams', () => {
    const ids = getEventChannelIds(makeEvent(['C1'], [['C2'], ['C3']]));
    expect([...ids].sort()).toEqual(['C1', 'C2', 'C3']);
  });

  it('dedupes a channel that appears on both the event and a work package', () => {
    const ids = getEventChannelIds(makeEvent(['C1'], [['C1', 'C2']]));
    expect([...ids].sort()).toEqual(['C1', 'C2']);
  });

  it('skips teams with no slack id', () => {
    expect(getEventChannelIds(makeEvent([null, ''], [[null]])).size).toBe(0);
  });

  it('returns nothing for an event with no teams or work packages', () => {
    expect(getEventChannelIds(makeEvent([], [])).size).toBe(0);
  });
});

describe('getDueTier', () => {
  const now = new Date('2026-01-15T12:00:00Z');
  const startsIn = (ms: number) => new Date(now.getTime() + ms);

  it.each([
    // 48h window: (46h, 48h]
    { label: '48h + 1ms before start', msUntil: 48 * HOUR_MS + 1, expected: undefined },
    { label: 'exactly 48h before start', msUntil: 48 * HOUR_MS, expected: Event_Reminder_Tier.HOURS_48 },
    { label: '46h + 1ms before start', msUntil: 46 * HOUR_MS + 1, expected: Event_Reminder_Tier.HOURS_48 },
    { label: 'exactly 46h before start', msUntil: 46 * HOUR_MS, expected: undefined },

    // gap between the 48h and 24h windows
    { label: '30h before start', msUntil: 30 * HOUR_MS, expected: undefined },

    // 24h window: (22h, 24h]
    { label: '24h + 1ms before start', msUntil: 24 * HOUR_MS + 1, expected: undefined },
    { label: 'exactly 24h before start', msUntil: 24 * HOUR_MS, expected: Event_Reminder_Tier.HOURS_24 },
    { label: '22h + 1ms before start', msUntil: 22 * HOUR_MS + 1, expected: Event_Reminder_Tier.HOURS_24 },
    { label: 'exactly 22h before start', msUntil: 22 * HOUR_MS, expected: undefined },

    // gap between the 24h and 1h windows
    { label: '10h before start', msUntil: 10 * HOUR_MS, expected: undefined },

    // 1h window: (0, 1h], lower bound clamped at the start time
    { label: '1h + 1ms before start', msUntil: HOUR_MS + 1, expected: undefined },
    { label: 'exactly 1h before start', msUntil: HOUR_MS, expected: Event_Reminder_Tier.HOURS_1 },
    { label: '1ms before start', msUntil: 1, expected: Event_Reminder_Tier.HOURS_1 },
    { label: 'at start', msUntil: 0, expected: undefined },
    { label: '1h after start', msUntil: -HOUR_MS, expected: undefined }
  ])('$label → $expected', ({ msUntil, expected }) => {
    expect(getDueTier(startsIn(msUntil), now)?.tier).toBe(expected);
  });
});
