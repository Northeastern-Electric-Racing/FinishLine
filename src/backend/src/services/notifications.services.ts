import prisma from '../prisma/prisma';
import {
  DesignReviewWithAttendees,
  TaskWithAssignees,
  endOfDayTomorrow,
  startOfDayTomorrow,
  usersToSlackPings
} from '../utils/notifications.utils';
import { sendMessage } from '../integrations/slack';
import { daysBetween, wbsPipe } from 'shared';
import { buildDueString } from '../utils/slack.utils';
import WorkPackagesService from './work-packages.services';
import { addWeeksToDate } from 'shared';
import { HttpException } from '../utils/errors.utils';
import { meetingStartTimePipe } from '../utils/design-reviews.utils';

export default class NotificationsService {
  static async sendDailySlackNotifications() {
    await NotificationsService.sendTaskDeadlineSlackNotifications();
    await NotificationsService.sendDesignReviewSlackNotifications();
    await NotificationsService.sendWorkPackageDeadlineSlackNotifications();
  }

  /**
   * Sends the task deadline slack notifications for all tasks with a deadline of tomorrow or before that are not done
   */
  static async sendTaskDeadlineSlackNotifications() {
    const endOfDay = endOfDayTomorrow();

    if (endOfDay.getDay() === 0 || endOfDay.getDay() === 2 || endOfDay.getDay() === 4) return;

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
      const teamSlackIds = task.wbsElement.project?.teams.map((team) => team.slackId) ?? [];

      teamSlackIds.forEach((teamSlackId) => {
        const currentTasks = teamTaskMap.get(teamSlackId);
        if (currentTasks) {
          currentTasks.push(task);
          teamTaskMap.set(teamSlackId, currentTasks);
        } else {
          teamTaskMap.set(teamSlackId, [task]);
        }
      });
    });

    // send the notifications to each team for their respective tasks
    const promises = Array.from(teamTaskMap).map(async ([slackId, tasks]) => {
      const messageBlock = tasks
        .map((task) => {
          const daysUntilDeadline = daysBetween(task.deadline, new Date());

          return `${usersToSlackPings(task.assignees ?? [])} <https://finishlinebyner.com/projects/${wbsPipe(
            task.wbsElement
          )}/tasks|${task.title}> ${buildDueString(daysUntilDeadline)} in project ${task.wbsElement?.name}`;
        })
        .join('\n\n');

      // messageBlock will be empty if there are tasks with no assignees
      if (messageBlock !== '')
        await sendMessage(
          slackId,
          ':sparkles: :pepe-coop: UPCOMING TASK DEADLINES :pepe-coop: :sparkles: \n\n\n' + messageBlock
        );
    });

    await Promise.all(promises);
  }

  /**
   * Sends the work package deadline slack notifications for all work packages with a deadline of next week
   */
  static async sendWorkPackageDeadlineSlackNotifications() {
    const date = new Date();
    if (date.getDay() === 1) {
      const nextWeek = addWeeksToDate(date, 1);
      const ADMIN = process.env.ADMIN_USER_ID;
      const admin = await prisma.user.findUnique({ where: { userId: ADMIN } });
      if (!admin) throw new HttpException(404, 'Admin user not found');
      const organizations = await prisma.organization.findMany();
      for (const organization of organizations) {
        await WorkPackagesService.slackMessageUpcomingDeadlines(admin, nextWeek, organization);
      }
    }
  }

  /**
   * Sends the design review slack notifications for all design reviews scheduled for today
   */
  static async sendDesignReviewSlackNotifications() {
    const endOfDay = startOfDayTomorrow();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const designReviews = await prisma.design_Review.findMany({
      where: {
        dateScheduled: {
          lt: endOfDay,
          gte: startOfDay
        },
        status: 'SCHEDULED',
        dateDeleted: null
      },
      include: {
        requiredMembers: { include: { userSettings: true } },
        optionalMembers: { include: { userSettings: true } },
        userCreated: { include: { userSettings: true } },
        wbsElement: {
          include: {
            project: { include: { teams: true } },
            workPackage: { include: { project: { include: { teams: true } } } }
          }
        }
      }
    });

    const designReviewTeamMap = new Map<string, DesignReviewWithAttendees[]>();

    designReviews.forEach((designReview) => {
      const teamSlackIds = designReview.wbsElement.project
        ? designReview.wbsElement.project.teams.map((team) => team.slackId)
        : designReview.wbsElement.workPackage?.project.teams.map((team) => team.slackId) ?? [];

      teamSlackIds.forEach((teamSlackId) => {
        const currentTasks = designReviewTeamMap.get(teamSlackId);
        if (currentTasks) {
          currentTasks.push({
            ...designReview,
            attendees: designReview.requiredMembers.concat(designReview.optionalMembers).concat(designReview.userCreated)
          });
          designReviewTeamMap.set(teamSlackId, currentTasks);
        } else {
          designReviewTeamMap.set(teamSlackId, [
            {
              ...designReview,
              attendees: designReview.requiredMembers.concat(designReview.optionalMembers).concat(designReview.userCreated)
            }
          ]);
        }
      });
    });

    // send the notifications to each team for their respective design reviews
    const promises = Array.from(designReviewTeamMap).map(async ([slackId, designReviews]) => {
      const messageBlock = designReviews
        .map((designReview) => {
          const zoomLink = designReview.zoomLink ? `Zoom Link: ${designReview.zoomLink}\n` : '';
          const questionDocLink = designReview.docTemplateLink
            ? ` Question Doc Link: ${designReview.docTemplateLink}\n`
            : '';
          return (
            `${usersToSlackPings(designReview.attendees ?? [])} ${
              designReview.wbsElement.name
            } will be having a design review today at ${meetingStartTimePipe(designReview.meetingTimes)}! ` +
            zoomLink +
            questionDocLink
          );
        })
        .join('\n\n');

      // messageBlock will be empty if there are design reviews with no attendees
      if (messageBlock !== '')
        await sendMessage(slackId, ':calendar: :clock9: Upcoming Design Reviews! :clock9: :calendar: \n\n\n' + messageBlock);
    });

    await Promise.all(promises);
  }
}
