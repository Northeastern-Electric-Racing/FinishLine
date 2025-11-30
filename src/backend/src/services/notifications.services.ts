import prisma from '../prisma/prisma';
import {
  TaskWithAssignees,
  endOfDayTomorrow,
  startOfDayTomorrow,
  usersToSlackPings,
  EventWithAttendees
} from '../utils/notifications.utils';
import { sendMessage } from '../integrations/slack';
import { daysBetween, meetingStartTimePipeNumbers, startOfDay, wbsPipe } from 'shared';
import { buildDueString, sendThreadResponse } from '../utils/slack.utils';
import WorkPackagesService from './work-packages.services';
import { addWeeksToDate } from 'shared';
import { HttpException } from '../utils/errors.utils';
import { Reimbursement_Status_Type } from '@prisma/client';
import { scheduleTimesTransformer } from '../transformers/calendar.transformer';

export default class NotificationsService {
  static async sendDailySlackNotifications() {
    await NotificationsService.sendTaskDeadlineSlackNotifications();
    await NotificationsService.sendEventSlackNotifications();
    await NotificationsService.sendWorkPackageDeadlineSlackNotifications();
    await NotificationsService.sendSponsorTaskNotifications();
    await NotificationsService.sendPendingSaboSubmissionNotifications();
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
          // prisma call earlier allows the forced unwrap (deadline is guaranteed to be a non-null value)
          const daysUntilDeadline = daysBetween(task.deadline!, new Date());

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
  static async sendEventSlackNotifications() {
    const endOfToday = startOfDayTomorrow();
    const startOfToday = startOfDay(new Date());

    const events = await prisma.event.findMany({
      where: {
        status: 'SCHEDULED',
        dateDeleted: null,
        workPackages: {
          some: {} // Event must have at least one work package to be a design review
        },
        scheduledTimes: {
          some: {
            initialDateScheduled: {
              lte: endOfToday,
              gte: startOfToday
            }
          }
        }
      },
      include: {
        requiredMembers: { include: { userSettings: true } },
        optionalMembers: { include: { userSettings: true } },
        userCreated: { include: { userSettings: true } },
        scheduledTimes: true,
        workPackages: {
          include: {
            wbsElement: true,
            project: {
              include: {
                teams: true,
                wbsElement: true
              }
            }
          }
        }
      }
    });

    const desginReviewEventTeamMap = new Map<string, EventWithAttendees[]>();

    events.forEach((event) => {
      // Get all unique teams from all work packages associated with this event
      const teamSlackIds = new Set<string>();

      event.workPackages.forEach((workPackage) => {
        workPackage.project.teams.forEach((team) => {
          if (team.slackId) {
            teamSlackIds.add(team.slackId);
          }
        });
      });

      teamSlackIds.forEach((teamSlackId) => {
        const currentEvents = desginReviewEventTeamMap.get(teamSlackId);
        const eventWithAttendees = {
          ...event,
          attendees: event.requiredMembers.concat(event.optionalMembers).concat(event.userCreated),
          scheduledTimes: event.scheduledTimes.map(scheduleTimesTransformer)
        };

        if (currentEvents) {
          currentEvents.push(eventWithAttendees);
        } else {
          desginReviewEventTeamMap.set(teamSlackId, [eventWithAttendees]);
        }
      });
    });

    // Send the notifications to each team for their respective design reviews
    const promises = Array.from(desginReviewEventTeamMap).map(async ([slackId, events]) => {
      const messageBlock = events
        .map((event) => {
          const zoomLink = event.zoomLink ? `<${event.zoomLink}|Zoom Link>\n` : '';
          const questionDocLink = event.questionDocument ? `<${event.questionDocument}|Question Doc Link>\n` : '';

          // Get work package names for this event
          const workPackageNames = event.workPackages.map((wp) => wp.wbsElement.name).join(', ');

          // Extract meeting times from scheduled slots
          const meetingTimes = event.scheduledTimes
            .map((slot) => (slot.startTime ? new Date(slot.startTime).getHours() : null))
            .filter((hour): hour is number => hour !== null)
            .sort((a, b) => a - b);

          return (
            `${usersToSlackPings(event.attendees ?? [])} ${event.title} (${workPackageNames}) ` +
            `will be having an event today at ${meetingStartTimePipeNumbers(meetingTimes)}! ` +
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

  /**
   * Sends the sponsor task slack notifications for all tasks with a notify date of today
   */
  static async sendSponsorTaskNotifications() {
    const startOfToday = startOfDay(new Date());
    const endOfToday = startOfDayTomorrow();

    const sponsorTasks = await prisma.sponsor_Task.findMany({
      where: {
        notifyDate: {
          not: null,
          gte: startOfToday,
          lt: endOfToday
        },
        dateDeleted: null,
        assigneeUserId: {
          not: null
        }
      },
      include: {
        assignee: { include: { userSettings: true } }
      }
    });

    const promises = sponsorTasks.map(async (sponsorTask) => {
      const sponsor = await prisma.sponsor.findUnique({
        where: { sponsorId: sponsorTask.sponsorId }
      });

      const organization = await prisma.organization.findUnique({
        where: { organizationId: sponsor?.organizationId }
      });

      if (!sponsor || !organization) return;

      const message = `${sponsorTask.assignee?.userSettings?.slackId ? `<@${sponsorTask.assignee?.userSettings?.slackId}>` : ''} Reminder for your task for ${sponsor.name}: ${sponsorTask.notes}`;

      if (organization.sponsorshipNotificationsSlackChannelId) {
        await sendMessage(
          organization.sponsorshipNotificationsSlackChannelId,
          message,
          `finishlinebyner.com/finance/companies/sponsors/${sponsor.sponsorId}`,
          `View Tasks for ${sponsor.name}`
        );
      }
    });

    await Promise.all(promises);
  }

  static async sendPendingSaboSubmissionNotifications() {
    const rrsPendingSaboSubmission = await prisma.reimbursement_Request.findMany({
      where: {
        dateDeleted: null,
        AND: [
          {
            reimbursementStatuses: {
              some: {
                type: Reimbursement_Status_Type.PENDING_SABO_SUBMISSION
              }
            }
          },
          {
            reimbursementStatuses: {
              none: {
                type: Reimbursement_Status_Type.SABO_SUBMITTED
              }
            }
          },
          {
            reimbursementStatuses: {
              none: {
                type: Reimbursement_Status_Type.DENIED
              }
            }
          }
        ]
      },
      include: {
        reimbursementStatuses: true,
        notificationSlackThreads: true,
        receiptPictures: true
      }
    });
    const promises = rrsPendingSaboSubmission.map(async (rr) => {
      const dateMarkedPendingSaboSubmission = rr.reimbursementStatuses.find(
        (status) => status.type === Reimbursement_Status_Type.PENDING_SABO_SUBMISSION
      )?.dateCreated;
      // Only send notification if it has been more than 24 hours since marked pending SABO submission
      if (dateMarkedPendingSaboSubmission && dateMarkedPendingSaboSubmission.getTime() <= Date.now() - 24 * 60 * 60 * 1000) {
        await sendThreadResponse(
          rr.notificationSlackThreads,
          `This Reimbursement Request is still pending SABO submission. Please submit to SABO and mark as submitted on Finishline as soon as possible.`
        );
      }
    });

    await Promise.all(promises);
  }
}
