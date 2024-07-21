import prisma from '../prisma/prisma';
import {
  TaskWithAssignees,
  endOfDayTomorrow,
  getTeamFromTaskAssignees,
  usersToSlackPings
} from '../utils/notifications.utils';
import { sendMessage } from '../integrations/slack';
import { daysBetween } from 'shared';
import { buildDueString } from '../utils/slack.utils';
import WorkPackagesService from './work-packages.services';
import { addWeeksToDate } from 'shared';
import { HttpException } from '../utils/errors.utils';

export default class NotificationsService {
  static async sendDailySlackNotifications() {
    await NotificationsService.sendTaskDeadlineSlackNotifications();
    const date = new Date();
    if (date.getDay() === 1) {
      const nextWeek = addWeeksToDate(date, 1);
      const ADMIN = process.env.ADMIN_USER_ID;
      const admin = await prisma.user.findUnique({ where: { userId: ADMIN } });
      if (!admin) throw new HttpException(404, 'Admin user not found');
      const organizations = await prisma.organization.findMany();
      for (const organization of organizations) {
        await WorkPackagesService.slackMessageUpcomingDeadlines(admin, nextWeek, organization.organizationId);
      }
    }
  }

  /**
   * Sends the task deadline slack notifications for all tasks with a deadline of tomorrow or before that are not done
   */
  static async sendTaskDeadlineSlackNotifications() {
    const endOfDay = endOfDayTomorrow();

    const tasks = await prisma.task.findMany({
      where: {
        deadline: {
          lt: endOfDay
        },
        status: {
          not: 'DONE'
        },
        dateDeleted: null
      },
      include: {
        assignees: {
          include: {
            userSettings: true,
            teamsAsHead: true,
            teamsAsLead: true,
            teamsAsMember: true
          }
        },
        wbsElement: {
          include: {
            project: { include: { teams: true } }
          }
        }
      }
    });

    const teamTaskMap = new Map<string, TaskWithAssignees[]>();

    // group tasks due by team in a map
    tasks.forEach((task) => {
      const teamSlackId = getTeamFromTaskAssignees(task.assignees).slackId;

      const currentTasks = teamTaskMap.get(teamSlackId);
      if (currentTasks) {
        currentTasks.push(task);
        teamTaskMap.set(teamSlackId, currentTasks);
      } else {
        teamTaskMap.set(teamSlackId, [task]);
      }
    });

    // send the notifications to each team for their respective tasks
    teamTaskMap.forEach((tasks, slackId) => {
      const messageBlock = tasks
        .map((task) => {
          const daysUntilDeadline = daysBetween(task.deadline, new Date());

          return `${usersToSlackPings(task.assignees ?? [])} ${task.title} ${buildDueString(daysUntilDeadline)} in project ${
            task.wbsElement?.name
          }`;
        })
        .join('\n\n');

      // messageBlock will be empty if there are tasks with no assignees
      if (messageBlock !== '')
        sendMessage(slackId, ':sparkles: :pepe-coop: UPCOMING TASK DEADLINES :pepe-coop: :sparkles: \n\n\n' + messageBlock);
    });
  }
}
