import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Event_Reminder_Tier } from '@prisma/client';
import prisma from '../../src/prisma/prisma';
import NotificationsService from '../../src/services/notifications.services';
import { sendMessage } from '../../src/integrations/slack';
import { HOUR_MS } from '../../src/utils/time.utils';
import { REMINDER_TIERS } from '../../src/utils/notifications.utils';

const labelFor = (tier: Event_Reminder_Tier) => REMINDER_TIERS.find((t) => t.tier === tier)!.label;

// mock only Slack; everything else, including Prisma, runs for real against the test database
vi.mock('../../src/integrations/slack', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/integrations/slack')>()),
  sendMessage: vi.fn()
}));

const mockedSend = vi.mocked(sendMessage);
const succeed = async (channelId: string) => ({ channelId, ts: '1700000000.000100' });
const run = (now: Date) => NotificationsService.sendEventReminderSlackNotifications(now, { retryDelayMs: 0 });
const alwaysFail = async () => undefined;
const sentChannels = () => mockedSend.mock.calls.map(([channelId]) => channelId).sort();

const MIN_MS = 60 * 1000;
const T = new Date('2026-01-15T18:00:00Z'); // slot start time
const before = (ms: number) => new Date(T.getTime() - ms);

const originalDevOverride = process.env.SEND_SLACK_MESSAGES_IN_DEV;

/* ---------------------------------- fixtures --------------------------------- */

const createdFixtures: {
  userId: string;
  organizationId: string;
  teamIds: string[];
  eventTypeId: string;
  eventId: string;
}[] = [];

const createReminderFixture = async ({
  startTime = T,
  teamSlackIds = ['C_TEAM'],
  notificationChannelIds = [] as string[]
} = {}) => {
  // googleAuthId and email are unique, so every fixture gets its own suffix
  const suffix = randomUUID();

  const user = await prisma.user.create({
    data: {
      firstName: 'Reminder',
      lastName: 'Tester',
      googleAuthId: `reminder-test-${suffix}`,
      email: `reminder-test-${suffix}@example.com`,
      userSettings: { create: {} } // slackId defaults to ''
    }
  });

  const organization = await prisma.organization.create({
    data: { name: `Reminder Test Org ${suffix}`, userCreatedId: user.userId }
  });

  const teams = await Promise.all(
    teamSlackIds.map((slackId, i) =>
      prisma.team.create({
        data: {
          teamName: `Reminder Team ${i}`,
          slackId,
          headId: user.userId,
          organizationId: organization.organizationId
        }
      })
    )
  );

  const eventType = await prisma.event_Type.create({
    data: {
      name: 'Design Review',
      userCreatedId: user.userId,
      organizationId: organization.organizationId,
      sendSlackNotifications: true,
      requiredMembers: true,
      optionalMembers: true,
      teams: true,
      teamType: false,
      location: true,
      zoomLink: true,
      shop: false,
      machinery: false,
      workPackage: true,
      questionDocument: true,
      documents: false,
      description: true,
      onlyHeadsOrAboveForEventCreation: false,
      requiresConfirmation: false
    }
  });

  const event = await prisma.event.create({
    data: {
      title: 'Reminder Test Event',
      userCreatedId: user.userId,
      eventTypeId: eventType.eventTypeId,
      approved: 'NO_CONFLICT',
      status: 'SCHEDULED',
      notificationChannelIds,
      teams: { connect: teams.map((t) => ({ teamId: t.teamId })) },
      scheduledTimes: { create: [{ startTime, endTime: new Date(startTime.getTime() + HOUR_MS) }] }
    },
    include: { scheduledTimes: true }
  });

  createdFixtures.push({
    userId: user.userId,
    organizationId: organization.organizationId,
    teamIds: teams.map((t) => t.teamId),
    eventTypeId: eventType.eventTypeId,
    eventId: event.eventId
  });

  return { event, slot: event.scheduledTimes[0] };
};

// delete in reverse dependency order so no foreign key blocks a delete
const cleanupFixtures = async () => {
  await prisma.event_Reminder.deleteMany();
  for (const f of createdFixtures.splice(0)) {
    await prisma.schedule_Slot.deleteMany({ where: { eventId: f.eventId } });
    await prisma.event.delete({ where: { eventId: f.eventId } });
    await prisma.event_Type.delete({ where: { eventTypeId: f.eventTypeId } });
    await prisma.team.deleteMany({ where: { teamId: { in: f.teamIds } } });
    await prisma.organization.delete({ where: { organizationId: f.organizationId } });
    await prisma.user_Settings.deleteMany({ where: { userId: f.userId } });
    await prisma.user.delete({ where: { userId: f.userId } });
  }
};

// the unique key of a 24h reminder for the default fixture slot, for seeding claims directly
const keyFor = (scheduleSlotId: string, slackChannelId = 'C_TEAM') => ({
  scheduleSlotId,
  tier: Event_Reminder_Tier.HOURS_24,
  slotStartTime: T,
  slackChannelId
});

/* ----------------------------------- tests ----------------------------------- */

describe('sendEventReminderSlackNotifications', () => {
  beforeEach(() => {
    process.env.SEND_SLACK_MESSAGES_IN_DEV = 'true';
    mockedSend.mockReset();
    mockedSend.mockImplementation(succeed);
  });

  afterEach(async () => {
    await cleanupFixtures();
  });

  afterAll(() => {
    process.env.SEND_SLACK_MESSAGES_IN_DEV = originalDevOverride;
  });

  describe('grace window edges', () => {
    it('sends just inside the 24h window and marks the claim SENT', async () => {
      await createReminderFixture();
      await run(before(24 * HOUR_MS));

      expect(mockedSend).toHaveBeenCalledTimes(1);
      expect(mockedSend.mock.calls[0][1]).toContain(labelFor(Event_Reminder_Tier.HOURS_24));
      const [row] = await prisma.event_Reminder.findMany();
      expect(row.status).toBe('SENT');
      expect(row.sentAt).not.toBeNull();
    });

    it('does not send just outside the upper edge', async () => {
      await createReminderFixture();
      await run(before(24 * HOUR_MS + 1));

      expect(mockedSend).not.toHaveBeenCalled();
      expect(await prisma.event_Reminder.count()).toBe(0);
    });

    it('skips a missed tier instead of catching up', async () => {
      await createReminderFixture();
      await run(before(22 * HOUR_MS));

      expect(mockedSend).not.toHaveBeenCalled();
      expect(await prisma.event_Reminder.count()).toBe(0);
    });

    it('does not send once the event has started', async () => {
      await createReminderFixture();
      await run(T);

      expect(mockedSend).not.toHaveBeenCalled();
    });
    it('does not emit an empty mention for attendees without a Slack id', async () => {
      await createReminderFixture();
      await run(before(23.5 * HOUR_MS));

      expect(mockedSend.mock.calls[0][1]).not.toContain('<@>');
    });
  });

  describe('exactly once', () => {
    it('does not resend on repeated runs within the same window', async () => {
      await createReminderFixture();
      await run(before(23.5 * HOUR_MS));
      await run(before(23.5 * HOUR_MS));
      await run(before(22.5 * HOUR_MS));

      expect(mockedSend).toHaveBeenCalledTimes(1);
    });

    it('sends each tier exactly once across a full lifecycle of 15-minute triggers', async () => {
      await createReminderFixture();
      for (let ms = 50 * HOUR_MS; ms > 0; ms -= 15 * MIN_MS) await run(before(ms));

      const texts = mockedSend.mock.calls.map(([, text]) => text);
      expect(texts).toHaveLength(3);
      expect(texts[0]).toContain(labelFor(Event_Reminder_Tier.HOURS_48));
      expect(texts[1]).toContain(labelFor(Event_Reminder_Tier.HOURS_24));
      expect(texts[2]).toContain(labelFor(Event_Reminder_Tier.HOURS_1));
    });

    it('treats a rescheduled slot as new', async () => {
      const { slot } = await createReminderFixture();
      await run(before(23 * HOUR_MS));

      const newStart = new Date(T.getTime() + 2 * HOUR_MS);
      await prisma.schedule_Slot.update({
        where: { scheduleSlotId: slot.scheduleSlotId },
        data: { startTime: newStart }
      });
      await run(new Date(newStart.getTime() - 23 * HOUR_MS));

      expect(mockedSend).toHaveBeenCalledTimes(2);
    });
  });

  describe('failed sends stay retryable', () => {
    it('retries a transient failure within the same run', async () => {
      await createReminderFixture();
      mockedSend.mockResolvedValueOnce(undefined);

      await run(before(23.5 * HOUR_MS));

      expect(mockedSend).toHaveBeenCalledTimes(2);
      expect((await prisma.event_Reminder.findFirstOrThrow()).status).toBe('SENT');
    });

    it('releases the claim after every attempt fails, then retries on the next trigger', async () => {
      await createReminderFixture();
      mockedSend.mockImplementation(alwaysFail);

      await run(before(23.5 * HOUR_MS));
      expect(mockedSend).toHaveBeenCalledTimes(3);
      expect(await prisma.event_Reminder.count()).toBe(0);

      mockedSend.mockImplementation(succeed);
      await run(before(23.25 * HOUR_MS));
      expect(mockedSend).toHaveBeenCalledTimes(4);
      expect((await prisma.event_Reminder.findFirstOrThrow()).status).toBe('SENT');
    });

    it('treats a thrown error like a failed send', async () => {
      await createReminderFixture();
      mockedSend.mockRejectedValue(new Error('slack down'));

      await run(before(23.5 * HOUR_MS));
      expect(mockedSend).toHaveBeenCalledTimes(3);
      expect(await prisma.event_Reminder.count()).toBe(0);
    });

    it('only retries the channel that failed', async () => {
      await createReminderFixture({ teamSlackIds: ['C_A', 'C_B'] });
      mockedSend.mockImplementation(async (channelId: string) => (channelId === 'C_B' ? undefined : succeed(channelId)));

      await run(before(23.5 * HOUR_MS));
      const rows = await prisma.event_Reminder.findMany();
      expect(rows.map((r) => [r.slackChannelId, r.status])).toEqual([['C_A', 'SENT']]);

      mockedSend.mockClear();
      mockedSend.mockImplementation(succeed);
      await run(before(23.25 * HOUR_MS));
      expect(sentChannels()).toEqual(['C_B']);
    });

    it('does not retry once the window has passed', async () => {
      await createReminderFixture();
      mockedSend.mockImplementation(alwaysFail);

      await run(before(22.5 * HOUR_MS));
      mockedSend.mockImplementation(succeed);
      await run(before(21.5 * HOUR_MS));

      expect(mockedSend).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('lease', () => {
    it('takes over and retries a stale PENDING claim left by an interrupted run', async () => {
      const { slot } = await createReminderFixture();
      const runAt = before(23.5 * HOUR_MS);
      await prisma.event_Reminder.create({
        data: {
          ...keyFor(slot.scheduleSlotId),
          status: 'PENDING',
          claimedAt: new Date(runAt.getTime() - 11 * MIN_MS)
        }
      });

      await run(runAt);

      expect(mockedSend).toHaveBeenCalledTimes(1);
      expect((await prisma.event_Reminder.findFirstOrThrow()).status).toBe('SENT');
    });

    it('leaves a fresh PENDING claim alone (another run is mid-send)', async () => {
      const { slot } = await createReminderFixture();
      const runAt = before(23.5 * HOUR_MS);
      await prisma.event_Reminder.create({
        data: {
          ...keyFor(slot.scheduleSlotId),
          status: 'PENDING',
          claimedAt: new Date(runAt.getTime() - MIN_MS)
        }
      });

      await run(runAt);

      expect(mockedSend).not.toHaveBeenCalled();
    });

    it('never retries a SENT reminder, however old', async () => {
      const { slot } = await createReminderFixture();
      const runAt = before(23.5 * HOUR_MS);
      await prisma.event_Reminder.create({
        data: {
          ...keyFor(slot.scheduleSlotId),
          status: 'SENT',
          claimedAt: new Date(runAt.getTime() - HOUR_MS)
        }
      });

      await run(runAt);

      expect(mockedSend).not.toHaveBeenCalled();
    });
    it('keeps an in-progress claim from being taken over while a slow send is running', async () => {
      await createReminderFixture();
      let release!: () => void;
      const blocked = new Promise<void>((resolve) => (release = resolve));
      mockedSend.mockImplementationOnce(async (channelId: string) => {
        await blocked;
        return succeed(channelId);
      });

      const runAt = before(23.5 * HOUR_MS);
      const slowRun = NotificationsService.sendEventReminderSlackNotifications(runAt, {
        retryDelayMs: 0,
        heartbeatMs: 10
      });
      await new Promise((resolve) => setTimeout(resolve, 200)); // let the claim land and the heartbeat fire

      // a trigger past the original lease would take the claim over if the heartbeat weren't refreshing it
      await run(new Date(runAt.getTime() + 11 * MIN_MS));
      expect(mockedSend).toHaveBeenCalledTimes(1);

      release();
      await slowRun;
      expect((await prisma.event_Reminder.findFirstOrThrow()).status).toBe('SENT');
    });
  });

  describe('standalone notification channels', () => {
    it('reminds an event that only has standalone channels', async () => {
      await createReminderFixture({ teamSlackIds: [], notificationChannelIds: ['C_NOTIFY'] });
      await run(before(23.5 * HOUR_MS));

      expect(sentChannels()).toEqual(['C_NOTIFY']);
    });

    it('sends once to a channel that is both a team and a standalone channel', async () => {
      await createReminderFixture({ teamSlackIds: ['C_TEAM'], notificationChannelIds: ['C_TEAM', 'C_NOTIFY'] });
      await run(before(23.5 * HOUR_MS));

      expect(sentChannels()).toEqual(['C_NOTIFY', 'C_TEAM']);
    });
  });
});
