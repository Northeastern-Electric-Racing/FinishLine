import prisma from '../prisma/prisma';
import { TaskWithAssignees, getTeamFromTaskAssignees, usersToSlackPings } from '../utils/deadline-notifications.utils';
import { sendMessage } from '../integrations/slack';

export default class DeadlineNotificationsService {
  /**
   * Sends the task deadline slack notifications for all tasks with a deadline of the given date
   * @param deadline the beginning of the deadline date (at 12am)
   */
  static async sendTaskDeadlineSlackNotifications(deadline: Date) {
    const startOfDay = deadline;
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

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
            userSecureSettings: true,
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
      const teamSlackId = getTeamFromTaskAssignees(task.assignees);

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
