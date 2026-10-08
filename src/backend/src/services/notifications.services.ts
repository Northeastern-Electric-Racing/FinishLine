import prisma from '../prisma/prisma.js';
import {
  TaskWithAssignees,
  endOfDayTomorrow,
  startOfDayTomorrow,
  usersToSlackPings,
  getDueTier,
  getEventChannelIds,
  buildReminderLine
} from '../utils/notifications.utils.js';
import { sendMessage } from '../integrations/slack.js';
import { daysBetween, wbsPipe } from 'shared';
import { buildDueString, sendThreadResponse } from '../utils/slack.utils.js';
import WorkPackagesService from './work-packages.services.js';
import { addWeeksToDate } from 'shared';
import { HttpException } from '../utils/errors.utils.js';
import { Reimbursement_Status_Type } from '@prisma/client';
import { eventReminderInclude } from '../transformers/notifications.transformer.js';
import { HOUR_MS } from '../utils/time.utils.js';
import { randomUUID } from 'crypto';

const CLAIM_LEASE_MS = 10 * 60 * 1000;
export default class NotificationsService {
  static async sendDailySlackNotifications() {
    await NotificationsService.sendTaskDeadlineSlackNotifications();
    await NotificationsService.sendWorkPackageDeadlineSlackNotifications();
    await NotificationsService.sendSponsorTaskNotifications();
    await NotificationsService.sendPendingSaboSubmissionNotifications();
  }

  static async sendHourlySlackNotifications() {
    await NotificationsService.sendEventReminderSlackNotifications();
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
   * Sends notifications for any upcoming events 48h, 24h and 1h before the event.
   */
  static async sendEventReminderSlackNotifications(now: Date = new Date()) {
    if (process.env.NODE_ENV !== 'production' && process.env.SEND_SLACK_MESSAGES_IN_DEV !== 'true') return;

    const horizon = new Date(now.getTime() + 48 * HOUR_MS);

    const slots = await prisma.schedule_Slot.findMany({
      where: {
        startTime: { gt: now, lte: horizon },
        event: { status: 'SCHEDULED', dateDeleted: null, eventType: { sendSlackNotifications: true } }
      },
      orderBy: { startTime: 'asc' },
      include: { event: { include: eventReminderInclude } }
    });

    const due = slots.flatMap((slot) => {
      if (!slot.startTime) return [];
      const tier = getDueTier(slot.startTime, now);
      return tier ? [{ slot, startTime: slot.startTime, tier }] : [];
    });

    const candidates = due.flatMap(({ slot, startTime, tier }) =>
      [...getEventChannelIds(slot.event)].map((slackChannelId) => ({ slot, startTime, tier, slackChannelId }))
    );

    if (candidates.length === 0) return;

    const runToken = randomUUID();
    const staleBefore = new Date(now.getTime() - CLAIM_LEASE_MS);

    const keys = candidates.map(({ slot, startTime, tier, slackChannelId }) => ({
      scheduleSlotId: slot.scheduleSlotId,
      tier: tier.tier,
      slotStartTime: startTime,
      slackChannelId
    }));

    await prisma.event_Reminder.createMany({
      data: keys.map((key) => ({ ...key, claimToken: runToken, claimedAt: now })),
      skipDuplicates: true
    });

    await prisma.event_Reminder.updateMany({
      where: { status: 'PENDING', claimedAt: { lt: staleBefore }, OR: keys },
      data: { claimToken: runToken, claimedAt: now }
    });

    const claimed = await prisma.event_Reminder.findMany({ where: { claimToken: runToken } });

    // a slot is only due for one tier per run, so slot + channel identifies the claim
    const claimKey = (scheduleSlotId: string, slackChannelId: string) => `${scheduleSlotId}:${slackChannelId}`;
    const claimedIdByKey = new Map(claimed.map((r) => [claimKey(r.scheduleSlotId, r.slackChannelId), r.eventReminderId]));

    const byChannel = new Map<string, { lines: string[]; reminderIds: string[] }>();

    candidates.forEach(({ slot, startTime, tier, slackChannelId }) => {
      const reminderId = claimedIdByKey.get(claimKey(slot.scheduleSlotId, slackChannelId));
      if (!reminderId) return; // sent, or being sent, by another run

      const entry = byChannel.get(slackChannelId) ?? { lines: [], reminderIds: [] };
      entry.lines.push(buildReminderLine(slot.event, startTime, tier.label));
      entry.reminderIds.push(reminderId);
      byChannel.set(slackChannelId, entry);
    });

    // sendMessage swallows Slack errors and returns undefined, so check the return value as well as catching
    const results = await Promise.all(
      [...byChannel].map(async ([channelId, { lines, reminderIds }]) => {
        try {
          const sent = await sendMessage(
            channelId,
            ':calendar: :clock9: Upcoming Events! :clock9: :calendar:\n\n\n' + lines.join('\n\n')
          );
          return { reminderIds, ok: !!sent };
        } catch {
          return { reminderIds, ok: false };
        }
      })
    );

    const sentIds = results.filter((r) => r.ok).flatMap((r) => r.reminderIds);
    const failedIds = results.filter((r) => !r.ok).flatMap((r) => r.reminderIds);

    // only touch rows this run still owns, in case a slow run's claims were taken over
    if (sentIds.length > 0) {
      await prisma.event_Reminder.updateMany({
        where: { eventReminderId: { in: sentIds }, claimToken: runToken },
        data: { status: 'SENT', sentAt: new Date() }
      });
    }

    // release failed sends so the next trigger retries them right away instead of waiting out the lease
    if (failedIds.length > 0) {
      await prisma.event_Reminder.deleteMany({
        where: { eventReminderId: { in: failedIds }, claimToken: runToken }
      });
    }
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
