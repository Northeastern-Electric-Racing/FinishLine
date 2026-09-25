import { describe, it, expect } from 'vitest';
import { getDueTier, getEventChannelIds } from '../../src/utils/notifications.utils';
import { Event_Reminder_Tier } from '@prisma/client';
import { HOUR_MS } from '../../src/prisma/dates';

const now = new Date('2026-01-15T12:00:00Z');
const at = (msFromNow: number) => new Date(now.getTime() + msFromNow);

const makeEvent = (eventTeamIds: (string | null)[], wpTeamIds: (string | null)[][]) =>
  ({
    teams: eventTeamIds.map((slackId) => ({ slackId })),
    workPackages: wpTeamIds.map((ids) => ({ project: { teams: ids.map((slackId) => ({ slackId })) } }))
  }) as any;

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
    const ids = getEventChannelIds(makeEvent([null, ''], [[null]]));
    expect(ids.size).toBe(0);
  });

  it('returns nothing for an event with no teams or work packages', () => {
    expect(getEventChannelIds(makeEvent([], [])).size).toBe(0);
  });

  describe('getDueTier', () => {
    it.each([
      ['48h + 1ms', 48 * HOUR_MS + 1, undefined],
      ['exactly 48h', 48 * HOUR_MS, Event_Reminder_Tier.HOURS_48],
      ['46h + 1ms', 46 * HOUR_MS + 1, Event_Reminder_Tier.HOURS_48],
      ['exactly 46h', 46 * HOUR_MS, undefined],

      ['30h', 30 * HOUR_MS, undefined],

      ['24h + 1ms', 24 * HOUR_MS + 1, undefined],
      ['exactly 24h', 24 * HOUR_MS, Event_Reminder_Tier.HOURS_24],
      ['22h + 1ms', 22 * HOUR_MS + 1, Event_Reminder_Tier.HOURS_24],
      ['exactly 22h', 22 * HOUR_MS, undefined],

      ['10h', 10 * HOUR_MS, undefined],

      ['1h + 1ms', HOUR_MS + 1, undefined],
      ['exactly 1h', HOUR_MS, Event_Reminder_Tier.HOURS_1],
      ['1ms before start', 1, Event_Reminder_Tier.HOURS_1],
      ['at start', 0, undefined],
      ['after start', -HOUR_MS, undefined]
    ])('%s before start → %s', (_label, msUntil, expected) => {
      expect(getDueTier(at(msUntil), now)?.tier).toBe(expected);
    });
  });
});
