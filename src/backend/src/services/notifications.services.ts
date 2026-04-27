import prisma from '../prisma/prisma.js';
import {
  TaskWithAssignees,
  endOfDayTomorrow,
  startOfDayTomorrow,
  startOfTodayEST,
  startOfTomorrowEST,
  usersToSlackPings,
  EventWithAttendees
} from '../utils/notifications.utils.js';
import { sendMessage } from '../integrations/slack.js';
import { daysBetween, wbsPipe, formatTimeForSlack } from 'shared';
import { buildDueString, sendThreadResponse } from '../utils/slack.utils.js';
import WorkPackagesService from './work-packages.services.js';
import { addWeeksToDate } from 'shared';
import { HttpException } from '../utils/errors.utils.js';
import { Reimbursement_Status_Type } from '@prisma/client';
import { scheduleTimesTransformer } from '../transformers/calendar.transformer.js';

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

    if (endOfDay.getUTCDay() === 0 || endOfDay.getUTCDay() === 2 || endOfDay.getUTCDay() === 4) return;

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
      orderBy: {
        deadline: 'asc' // earliest (most overdue) first
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

    // group tasks due by team
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

    // send the notifications to each team for their respective tasks sorted by deadline
    const promises = Array.from(teamTaskMap).map(async ([slackId, tasks]) => {
      const messageBlock = tasks
        .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
        .map((task) => {
          // prisma call earlier allows the forced unwrap (deadline is guaranteed to be a non-null value)
          const todayMidnightUTC = new Date(new Date().setUTCHours(0, 0, 0, 0));
          const daysUntilDeadline = daysBetween(task.deadline!, todayMidnightUTC);

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
   * Sends Slack notifications for all events scheduled for today whose event type has sendSlackNotifications enabled
   */
  static async sendEventSlackNotifications() {
    const endOfToday = startOfTomorrowEST();
    const startOfToday = startOfTodayEST();

    const events = await prisma.event.findMany({
      where: {
        status: 'SCHEDULED',
        dateDeleted: null,
        scheduledTimes: {
          some: {
            AND: [{ endTime: { gte: startOfToday } }, { startTime: { lte: endOfToday } }]
          }
        },
        eventType: {
          sendSlackNotifications: true
        }
      },
      include: {
        requiredMembers: { include: { userSettings: true } },
        optionalMembers: { include: { userSettings: true } },
        userCreated: { include: { userSettings: true } },
        scheduledTimes: true,
        teams: true,
        eventType: true,
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

    const eventTeamMap = new Map<string, EventWithAttendees[]>();

    events.forEach((event) => {
      // Collect unique team Slack IDs: first from teams directly on the event, then from work packages
      const teamSlackIds = new Set<string>();

      event.teams.forEach((team) => {
        if (team.slackId) {
          teamSlackIds.add(team.slackId);
        }
      });

      event.workPackages.forEach((workPackage) => {
        workPackage.project.teams.forEach((team) => {
          if (team.slackId) {
            teamSlackIds.add(team.slackId);
          }
        });
      });

      teamSlackIds.forEach((teamSlackId) => {
        const currentEvents = eventTeamMap.get(teamSlackId);
        const eventWithAttendees = {
          ...event,
          attendees: event.requiredMembers.concat(event.optionalMembers).concat(event.userCreated),
          scheduledTimes: event.scheduledTimes.map(scheduleTimesTransformer)
        };

        if (currentEvents) {
          currentEvents.push(eventWithAttendees);
        } else {
          eventTeamMap.set(teamSlackId, [eventWithAttendees]);
        }
      });
    });

    // Send the notifications to each team for their respective events
    const promises = Array.from(eventTeamMap).map(async ([slackId, events]) => {
      const messageBlock = events
        .map((event) => {
          const zoomLink = event.zoomLink ? `<${event.zoomLink}|Zoom Link>\n` : '';
          const questionDocLink = event.questionDocumentLink ? `<${event.questionDocumentLink}|Question Doc Link>\n` : '';

          const workPackageNames = event.workPackages.map((wp) => wp.wbsElement.name).join(', ');
          const workPackagesPart = workPackageNames ? ` (${workPackageNames})` : '';

          // Get the earliest scheduled start time for display
          const [earliestSlot] = event.scheduledTimes
            .filter((slot) => slot.startTime)
            .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());
          const timeDisplay = earliestSlot ? formatTimeForSlack(new Date(earliestSlot.startTime!)) : 'TBD';

          return (
            `${usersToSlackPings(event.attendees ?? [])} *${event.eventType.name}*: ${event.title}${workPackagesPart} ` +
            `will be having an event today at ${timeDisplay} ET! ` +
            zoomLink +
            questionDocLink
          );
        })
        .join('\n\n');

      // messageBlock will be empty if there are events with no attendees
      if (messageBlock !== '')
        await sendMessage(slackId, ':calendar: :clock9: Upcoming Events! :clock9: :calendar: \n\n\n' + messageBlock);
    });

    await Promise.all(promises);
  }

  /**
   * Sends the sponsor task slack notifications for all tasks with a notify date of today
   */
  static async sendSponsorTaskNotifications() {
    const startOfToday = new Date(new Date().setUTCHours(0, 0, 0, 0));
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
      const slackMention = sponsorTask.assignee?.userSettings?.slackId
        ? `<@${sponsorTask.assignee.userSettings.slackId}>`
        : '';

      if (sponsorTask.sponsorId) {
        const sponsor = await prisma.sponsor.findUnique({
          where: { sponsorId: sponsorTask.sponsorId }
        });

        if (!sponsor) return;

        const organization = await prisma.organization.findUnique({
          where: { organizationId: sponsor.organizationId ?? undefined }
        });

        if (!organization) return;

        const message = `${slackMention} Reminder for your task for ${sponsor.name}: ${sponsorTask.notes}`;

        if (organization.sponsorshipNotificationsSlackChannelId) {
          await sendMessage(
            organization.sponsorshipNotificationsSlackChannelId,
            message,
            `finishlinebyner.com/finance/companies/sponsors/${sponsor.sponsorId}`,
            `View Tasks for ${sponsor.name}`
          );
        }
      } else if (sponsorTask.prospectiveSponsorId) {
        const prospectiveSponsor = await prisma.prospective_Sponsor.findUnique({
          where: { prospectiveSponsorId: sponsorTask.prospectiveSponsorId }
        });

        if (!prospectiveSponsor) return;

        const organization = await prisma.organization.findUnique({
          where: { organizationId: prospectiveSponsor.organizationId }
        });

        if (!organization) return;

        const message = `${slackMention} Reminder for your task for prospective sponsor ${prospectiveSponsor.organizationName}: ${sponsorTask.notes}`;

        if (organization.sponsorshipNotificationsSlackChannelId) {
          await sendMessage(
            organization.sponsorshipNotificationsSlackChannelId,
            message,
            `finishlinebyner.com/finance/companies/sponsors`,
            `View Prospective Sponsors`
          );
        }
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
