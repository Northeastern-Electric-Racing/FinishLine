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
        .map(
          (task) =>
            `${usersToSlackPings(task.assignees ?? [])} ${task.title} due tomorrow in project ${task.wbsElement?.name}`
        )
        .join('\n\n');

      // messageBlock will be empty if there are tasks with no assignees
      if (messageBlock !== '')
        sendMessage(slackId, ':sparkles: :pepe-coop: UPCOMING TASK DEADLINES :pepe-coop: :sparkles: \n\n\n' + messageBlock);
    });
  }
}
