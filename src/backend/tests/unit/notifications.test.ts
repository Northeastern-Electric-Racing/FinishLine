import { describe, it, expect } from 'vitest';
import { getEventChannelIds } from '../../src/utils/notifications.utils';

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
});