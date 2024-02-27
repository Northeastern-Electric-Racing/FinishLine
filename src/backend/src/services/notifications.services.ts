import prisma from '../prisma/prisma';
import {
  TaskWithAssignees,
  endOfDayTomorrow,
  getTeamFromTaskAssignees,
  startOfDayTomorrow,
  usersToSlackPings
} from '../utils/notifications.utils';
import { sendMessage } from '../integrations/slack';

export default class NotificationsService {
  /**
   * Sends the task deadline slack notifications for all tasks with a deadline of tomorrow
   */
  static async sendTaskDeadlineSlackNotifications() {
    const startOfDay = startOfDayTomorrow();
    const endOfDay = endOfDayTomorrow();

    const tasks = await prisma.task.findMany({
      where: {
        deadline: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: {
          not: 'DONE'
        }
      },
      include: {
        assignees: {
          include: {
            userSettings: true,
            teamAsHead: true,
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
        // ensures that the task has assignees to send a reminder for
        .filter((task) => task.assignees)
        .map(
          (task) =>
            `${usersToSlackPings(task.assignees ?? [])} Reminder: ${task.title} due tomorrow in project ${
              task.wbsElement?.name
            }`
        )
        .join('\n\n');

      sendMessage(slackId, messageBlock);
    });
  }
}
