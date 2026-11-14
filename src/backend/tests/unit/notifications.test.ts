import { describe, it, expect } from 'vitest';
import { getEventChannelIds } from '../../src/utils/notifications.utils';

const makeEvent = (teamSlackIds: string[], wpTeamSlackIds: string[][], notificationChannelIds: string[] = []) => ({
  notificationChannelIds,
  teams: teamSlackIds.map((slackId) => ({ slackId })),
  workPackages: wpTeamSlackIds.map((ids) => ({ project: { teams: ids.map((slackId) => ({ slackId })) } }))
});

describe('getEventChannelIds', () => {
  it('collects event teams and work package project teams', () => {
    const ids = getEventChannelIds(makeEvent(['C1'], [['C2'], ['C3']]));
    expect([...ids].sort()).toEqual(['C1', 'C2', 'C3']);
  });

  it('includes standalone notification channels', () => {
    const ids = getEventChannelIds(makeEvent([], [], ['C_NOTIFY']));
    expect([...ids]).toEqual(['C_NOTIFY']);
  });

  it('dedupes a channel that is both a team and a notification channel', () => {
    const ids = getEventChannelIds(makeEvent(['C1'], [['C1', 'C2']], ['C1', 'C3']));
    expect([...ids].sort()).toEqual(['C1', 'C2', 'C3']);
  });

  it('skips empty ids', () => {
    expect(getEventChannelIds(makeEvent([''], [['']], [''])).size).toBe(0);
  });
});
