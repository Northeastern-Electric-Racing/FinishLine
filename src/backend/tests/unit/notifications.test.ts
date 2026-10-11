import { Mock, vi } from 'vitest';
import NotificationsService from '../../src/services/notifications.services.js';
import prisma from '../../src/prisma/prisma.js';
import { sendMessage } from '../../src/integrations/slack.js';
import { getFrontendBaseUrl } from '../../src/utils/urls.utils.js';

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
  });
});
