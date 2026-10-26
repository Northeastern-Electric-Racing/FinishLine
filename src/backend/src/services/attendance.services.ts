import { Conflict_Status, Event_Status, Organization } from '@prisma/client';
import { MeetingAttendance, MeetingAttendanceWithAttendees, RoleEnum, User, isAtLeastRank } from 'shared';
import prisma from '../prisma/prisma.js';
import { AccessDeniedException, HttpException, NotFoundException } from '../utils/errors.utils.js';
import {
  getMeetingAttendanceQueryArgs,
  getMeetingAttendanceWithAttendeesQueryArgs
} from '../prisma-query-args/attendance.query-args.js';
import {
  meetingAttendanceTransformer,
  meetingAttendanceWithAttendeesTransformer
} from '../transformers/attendance.transformer.js';
import {
  checkBotInChannel,
  deleteMessage,
  editMessage,
  getChannelName,
  replyToMessageInThread,
  sendMessage
} from '../integrations/slack.js';
import { userHasPermission } from '../utils/users.utils.js';
import { calculateTeamMemberAttendancePercent } from '../utils/attendance.utils.js';

export default class AttendanceService {
  static async takeAttendance(
    submitter: User,
    teamId: string,
    message: string,
    organization: Organization
  ): Promise<MeetingAttendance> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      include: { members: true }
    });

    if (!team) throw new NotFoundException('Team', teamId);
    if (team.organizationId !== organization.organizationId) throw new NotFoundException('Team', teamId);

    if (
      !(await userHasPermission(submitter.userId, organization.organizationId, (role) =>
        isAtLeastRank(RoleEnum.ADMIN, role)
      )) &&
      submitter.userId !== team.headId
    ) {
      throw new AccessDeniedException('Only team heads or admins can take attendance');
    }

    const openAttendance = await prisma.meeting_Attendance.findFirst({
      where: { teamId, closedAt: null, organizationId: organization.organizationId }
    });

    if (openAttendance) {
      throw new HttpException(400, 'There is already an open attendance session for this team');
    }

    const result = await sendMessage(team.slackId, message);
    if (!result) {
      throw new HttpException(
        500,
        'Failed to send Slack message. Check that the team Slack ID is valid and the bot is in the channel.'
      );
    }

    const attendance = await prisma.meeting_Attendance.create({
      data: {
        organizationId: organization.organizationId,
        teamId,
        userCreatedId: submitter.userId,
        slackChannelId: result.channelId,
        slackMessageTimestamp: result.ts
      },
      ...getMeetingAttendanceQueryArgs(organization.organizationId)
    });

    setTimeout(() => AttendanceService.closeAttendance(attendance.meetingAttendanceId), 3600000);

    return meetingAttendanceTransformer(attendance);
  }

  static async getAttendanceById(
    meetingAttendanceId: string,
    organization: Organization
  ): Promise<MeetingAttendanceWithAttendees> {
    const attendance = await prisma.meeting_Attendance.findUnique({
      where: { meetingAttendanceId },
      ...getMeetingAttendanceWithAttendeesQueryArgs(organization.organizationId)
    });

    if (!attendance || attendance.organizationId !== organization.organizationId) {
      throw new NotFoundException('Meeting Attendance', meetingAttendanceId);
    }

    return meetingAttendanceWithAttendeesTransformer(attendance);
  }

  static async getAllAttendances(organization: Organization): Promise<MeetingAttendance[]> {
    const attendances = await prisma.meeting_Attendance.findMany({
      where: { organizationId: organization.organizationId },
      ...getMeetingAttendanceQueryArgs(organization.organizationId),
      orderBy: { openedAt: 'desc' }
    });

    return attendances.map(meetingAttendanceTransformer);
  }

  static async handleReactionAdded(slackUserId: string, channelId: string, messageTimestamp: string): Promise<void> {
    const attendance = await prisma.meeting_Attendance.findFirst({
      where: { slackChannelId: channelId, slackMessageTimestamp: messageTimestamp, closedAt: null }
    });

    if (!attendance) return;

    const userWithSettings = await prisma.user.findFirst({
      where: {
        userSettings: { slackId: slackUserId },
        organizations: { some: { organizationId: attendance.organizationId } }
      }
    });

    if (!userWithSettings) {
      await replyToMessageInThread(
        channelId,
        messageTimestamp,
        `<@${slackUserId}> Your Slack ID is not linked to a FinishLine account. Please set your Slack ID in your profile settings to be counted for attendance.`
      );
      return;
    }

    await prisma.meeting_Attendance.update({
      where: { meetingAttendanceId: attendance.meetingAttendanceId },
      data: {
        attendees: { connect: { userId: userWithSettings.userId } }
      }
    });
  }

  static async closeAttendance(meetingAttendanceId: string): Promise<void> {
    const attendance = await prisma.meeting_Attendance.findUnique({
      where: { meetingAttendanceId },
      include: {
        team: {
          select: {
            headId: true,
            members: { select: { userId: true } },
            leads: { select: { userId: true } }
          }
        },
        attendees: { select: { userId: true } }
      }
    });

    if (!attendance || attendance.closedAt) return;

    const attendeesCount = attendance.attendees.length;
    const teamMemberPercent = calculateTeamMemberAttendancePercent(attendance.team, attendance.attendees);

    const closedMessage = `Attendance is now closed. ${attendeesCount} attended (${teamMemberPercent.toFixed(1)}% of team).`;
    await editMessage(attendance.slackChannelId, attendance.slackMessageTimestamp, closedMessage);

    await prisma.meeting_Attendance.update({
      where: { meetingAttendanceId },
      data: { closedAt: new Date() }
    });
  }

  /**
   * Closes the given attendance sessions one at a time, logging failures so one bad session doesn't stop the rest.
   *
   * @param meetingAttendanceIds the attendance sessions to close
   */
  static async closeAttendances(meetingAttendanceIds: string[]): Promise<void> {
    for (const meetingAttendanceId of meetingAttendanceIds) {
      try {
        await AttendanceService.closeAttendance(meetingAttendanceId);
      } catch (error: unknown) {
        console.error(`Failed to close attendance ${meetingAttendanceId}:`, error);
      }
    }
  }

  /**
   * Run by the bay-cron scheduled job. Closes attendance for meetings that are no longer happening, then
   * opens attendance for meetings that have started. Reads the events' current schedule slots on every run,
   * so meetings that are edited, rescheduled, or deleted are picked up on the next run.
   */
  static async updateScheduledAttendances(): Promise<void> {
    await AttendanceService.closeEndedScheduledAttendances();
    await AttendanceService.openScheduledAttendances();
  }

  /**
   * Closes every automatically opened attendance session whose meeting is no longer happening: its event
   * was deleted, or none of its event's schedule slots are going on right now (the meeting ended, was
   * moved, or its slot was deleted).
   */
  static async closeEndedScheduledAttendances(): Promise<void> {
    const now = new Date();

    const attendances = await prisma.meeting_Attendance.findMany({
      where: {
        closedAt: null,
        event: {
          OR: [
            { dateDeleted: { not: null } },
            { scheduledTimes: { none: { allDay: false, startTime: { lte: now }, endTime: { gt: now } } } }
          ]
        }
      },
      select: { meetingAttendanceId: true }
    });

    await AttendanceService.closeAttendances(attendances.map((attendance) => attendance.meetingAttendanceId));
  }

  /**
   * Opens attendance in each team's slack channel for every schedule slot that is currently happening
   * on an event whose event type takes attendance. Safe to run repeatedly, since a team only gets one
   * attendance session per meeting.
   */
  static async openScheduledAttendances(): Promise<void> {
    const now = new Date();

    const scheduleSlots = await prisma.schedule_Slot.findMany({
      where: {
        allDay: false,
        startTime: { lte: now },
        endTime: { gt: now },
        event: {
          status: Event_Status.SCHEDULED,
          dateDeleted: null,
          approved: { in: [Conflict_Status.NO_CONFLICT, Conflict_Status.APPROVED] },
          eventType: { takeAttendance: true, dateDeleted: null }
        }
      },
      select: {
        startTime: true,
        event: {
          select: {
            eventId: true,
            title: true,
            userCreatedId: true,
            eventType: { select: { organizationId: true } },
            teams: { where: { dateArchived: null }, select: { teamId: true, slackId: true } }
          }
        }
      }
    });

    if (scheduleSlots.length === 0) return;

    // A team can only have one open attendance session at a time, so teams with one wait for it to close.
    // Different teams can still take attendance at the same time.
    const openAttendances = await prisma.meeting_Attendance.findMany({
      where: { closedAt: null },
      select: { teamId: true }
    });
    const teamsWithOpenAttendance = new Set(openAttendances.map((attendance) => attendance.teamId));

    // Sessions already opened for these meetings, so a meeting never gets a second session
    const meetingAttendances = await prisma.meeting_Attendance.findMany({
      where: {
        OR: scheduleSlots.map((scheduleSlot) => ({
          eventId: scheduleSlot.event.eventId,
          openedAt: { gte: scheduleSlot.startTime }
        }))
      },
      select: { eventId: true, teamId: true }
    });
    const meetingTeamKey = (eventId: string, teamId: string) => `${eventId}:${teamId}`;
    const meetingsWithAttendance = new Set(
      meetingAttendances.flatMap((attendance) =>
        attendance.eventId === null ? [] : [meetingTeamKey(attendance.eventId, attendance.teamId)]
      )
    );

    for (const { event } of scheduleSlots) {
      for (const team of event.teams) {
        if (
          meetingsWithAttendance.has(meetingTeamKey(event.eventId, team.teamId)) ||
          teamsWithOpenAttendance.has(team.teamId)
        )
          continue;

        try {
          const result = await sendMessage(
            team.slackId,
            `<!channel> Please react to this message to confirm your attendance at ${event.title}!`
          );
          if (!result) {
            console.error(`Failed to send attendance message for event ${event.eventId} to team ${team.teamId}`);
            continue;
          }

          await prisma.meeting_Attendance
            .create({
              data: {
                organizationId: event.eventType.organizationId,
                teamId: team.teamId,
                userCreatedId: event.userCreatedId,
                slackChannelId: result.channelId,
                slackMessageTimestamp: result.ts,
                eventId: event.eventId,
                openedAt: now
              }
            })
            .catch(async (error: unknown) => {
              // Don't leave a message in slack that no attendance session is tracking
              await deleteMessage(result.channelId, result.ts);
              throw error;
            });

          teamsWithOpenAttendance.add(team.teamId);
        } catch (error: unknown) {
          console.error(`Failed to open attendance for event ${event.eventId} for team ${team.teamId}:`, error);
        }
      }
    }
  }

  static async getOngoingAttendance(teamId: string, organization: Organization): Promise<MeetingAttendance | null> {
    const team = await prisma.team.findUnique({ where: { teamId } });

    if (!team || team.organizationId !== organization.organizationId) {
      throw new NotFoundException('Team', teamId);
    }

    const attendance = await prisma.meeting_Attendance.findFirst({
      where: { teamId, closedAt: null, organizationId: organization.organizationId },
      ...getMeetingAttendanceQueryArgs(organization.organizationId)
    });

    return attendance ? meetingAttendanceTransformer(attendance) : null;
  }

  static async closeOngoingAttendance(teamId: string, submitter: User, organization: Organization): Promise<void> {
    const team = await prisma.team.findUnique({ where: { teamId } });

    if (!team || team.organizationId !== organization.organizationId) {
      throw new NotFoundException('Team', teamId);
    }

    if (
      !(await userHasPermission(submitter.userId, organization.organizationId, (role) =>
        isAtLeastRank(RoleEnum.ADMIN, role)
      )) &&
      submitter.userId !== team.headId
    ) {
      throw new AccessDeniedException('Only team heads or admins can close attendance');
    }

    const openAttendance = await prisma.meeting_Attendance.findFirst({
      where: { teamId, closedAt: null, organizationId: organization.organizationId }
    });

    if (!openAttendance) {
      throw new HttpException(400, 'There is no open attendance session for this team');
    }

    if (openAttendance.eventId !== null) {
      throw new HttpException(
        400,
        'This attendance session was opened automatically for a meeting and will close when the meeting ends'
      );
    }

    await AttendanceService.closeAttendance(openAttendance.meetingAttendanceId);
  }

  static async checkTeamChannel(
    teamId: string,
    organization: Organization
  ): Promise<{ channelName: string | undefined; valid: boolean }> {
    const team = await prisma.team.findUnique({ where: { teamId } });

    if (!team || team.organizationId !== organization.organizationId) {
      throw new NotFoundException('Team', teamId);
    }

    const channelName = await getChannelName(team.slackId);
    const botInChannel = channelName ? await checkBotInChannel(team.slackId) : false;
    return { channelName, valid: !!channelName && botInChannel };
  }
}
