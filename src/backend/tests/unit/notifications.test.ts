import { Mock, vi } from 'vitest';
import NotificationsService from '../../src/services/notifications.services.js';
import prisma from '../../src/prisma/prisma.js';
import { sendMessage } from '../../src/integrations/slack.js';
import { getFrontendBaseUrl } from '../../src/utils/urls.utils.js';
import { splitSlackMessage } from '../../src/utils/slack.utils.js';

vi.mock('../../src/integrations/slack.js', () => ({
  sendMessage: vi.fn()
}));

const assignee = { userId: 'user-1', firstName: 'Bruce', lastName: 'Wayne', userSettings: { slackId: 'U123' } };

// builds a task (in the shape the deadline query returns) on the given project, owned by the given team channels
const makeTask = (title: string, projectNumber: number, teamSlackIds: string[]) => ({
  title,
  deadline: new Date('2026-10-04T00:00:00Z'),
  assignees: [assignee],
  wbsElement: {
    carNumber: 1,
    projectNumber,
    workPackageNumber: 0,
    name: `Project ${projectNumber}`,
    project: { teams: teamSlackIds.map((slackId) => ({ slackId })) }
  }
});

describe('Notifications Service Tests', () => {
  describe('sendTaskDeadlineSlackNotifications', () => {
    beforeEach(() => {
      // a monday, so the deadline notifications are not skipped for the day
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-10-05T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
      (sendMessage as Mock).mockReset();
    });

    it("links each channel's message to the task board filtered by that channel's distinct projects", async () => {
      vi.spyOn(prisma.task, 'findMany').mockResolvedValue([
        makeTask('task a', 2, ['C_SOFTWARE']),
        makeTask('task b', 2, ['C_SOFTWARE']),
        makeTask('task c', 5, ['C_SOFTWARE', 'C_ELECTRICAL'])
      ] as any);

      await NotificationsService.sendTaskDeadlineSlackNotifications();

      expect(sendMessage).toHaveBeenCalledTimes(2);
      expect(sendMessage).toHaveBeenCalledWith(
        'C_SOFTWARE',
        expect.stringContaining('task a'),
        `${getFrontendBaseUrl()}/tasks?projects=1.2.0%2C1.5.0`,
        'View Tasks on Task Board'
      );
      expect(sendMessage).toHaveBeenCalledWith(
        'C_ELECTRICAL',
        expect.stringContaining('task c'),
        `${getFrontendBaseUrl()}/tasks?projects=1.5.0`,
        'View Tasks on Task Board'
      );
    });

    it('splits a long reminder across messages, with the link only on the last one', async () => {
      vi.spyOn(prisma.task, 'findMany').mockResolvedValue(
        Array.from({ length: 40 }, (_, i) => makeTask(`task ${i} ${'x'.repeat(150)}`, 2, ['C_SOFTWARE'])) as any
      );

      await NotificationsService.sendTaskDeadlineSlackNotifications();

      const calls = (sendMessage as Mock).mock.calls;
      expect(calls.length).toBeGreaterThan(1);
      calls.forEach(([, message]) => expect(message.length).toBeLessThanOrEqual(3000));
      calls.slice(0, -1).forEach(([, , link, linkText]) => {
        expect(link).toBeUndefined();
        expect(linkText).toBeUndefined();
      });
      expect(calls[calls.length - 1][2]).toBe(`${getFrontendBaseUrl()}/tasks?projects=1.2.0`);
      expect(calls[calls.length - 1][3]).toBe('View Tasks on Task Board');
      // every task is sent exactly once, in order
      const sentText = calls.map(([, message]) => message).join('\n\n');
      Array.from({ length: 40 }, (_, i) => expect(sentText).toContain(`task ${i} `));
    });
  });

  describe('splitSlackMessage', () => {
    const header = 'HEADER\n';

    it('keeps a short message as one message', () => {
      expect(splitSlackMessage(header, ['a', 'b'], '\n\n')).toEqual(['HEADER\na\n\nb']);
    });

    it('returns no messages when there are no lines', () => {
      expect(splitSlackMessage(header, [], '\n\n')).toEqual([]);
    });

    it('splits long messages without breaking lines, with the header only on the first', () => {
      const lines = Array.from({ length: 30 }, (_, i) => `${i}`.padEnd(200, 'x'));
      const messages = splitSlackMessage(header, lines, '\n\n');

      expect(messages.length).toBeGreaterThan(1);
      messages.forEach((message) => expect(message.length).toBeLessThanOrEqual(3000));
      expect(messages[0].startsWith(header)).toBe(true);
      messages.slice(1).forEach((message) => expect(message).not.toContain(header));
      expect(messages.join('\n\n')).toBe(header + lines.join('\n\n'));
    });

    it('truncates a single line that is too long on its own', () => {
      const messages = splitSlackMessage(header, ['short', 'y'.repeat(5000)], '\n\n');
      expect(messages).toEqual(['HEADER\nshort', 'y'.repeat(3000)]);
    });
  });
});
