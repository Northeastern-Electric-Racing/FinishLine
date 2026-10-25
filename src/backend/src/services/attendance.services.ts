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
   * Gets the ids of the open attendance sessions tied to the given schedule slots.
   *
   * @param scheduleSlotIds the schedule slots to look up
   * @returns the ids of the open attendance sessions for those slots
   */
  static async getOpenAttendanceIdsForScheduleSlots(scheduleSlotIds: string[]): Promise<string[]> {
    const attendances = await prisma.meeting_Attendance.findMany({
      where: { scheduleSlotId: { in: scheduleSlotIds }, closedAt: null },
      select: { meetingAttendanceId: true }
    });
    return attendances.map((attendance) => attendance.meetingAttendanceId);
  }

  /**
   * Closes the open attendance sessions for the given schedule slots. Must be called before the slots are
   * deleted, since deleting a slot unlinks its sessions and the scheduled job can no longer close them.
   *
   * @param scheduleSlotIds the schedule slots being removed
   */
  static async closeAttendancesForScheduleSlots(scheduleSlotIds: string[]): Promise<void> {
    await AttendanceService.closeAttendances(await AttendanceService.getOpenAttendanceIdsForScheduleSlots(scheduleSlotIds));
  }

  /**
   * Moves open attendance sessions onto a new schedule slot, used when an event is rescheduled and its old
   * slots are replaced, so the meeting keeps its attendance session instead of getting a second one.
   * The scheduled job closes the session if the new slot isn't happening right now.
   *
   * @param meetingAttendanceIds the open sessions from the replaced slots
   * @param scheduleSlotId the event's new schedule slot
   */
  static async moveAttendancesToScheduleSlot(meetingAttendanceIds: string[], scheduleSlotId: string): Promise<void> {
    if (meetingAttendanceIds.length === 0) return;

    await prisma.meeting_Attendance.updateMany({
      where: { meetingAttendanceId: { in: meetingAttendanceIds } },
      data: { scheduleSlotId }
    });
  }

  /**
   * Run by the bay-cron scheduled job. Closes attendance for meetings that are no longer happening, then
   * opens attendance for meetings that have started. Reads the slots' current times on every run, so
   * meetings that are edited, rescheduled, or deleted are picked up on the next run.
   */
  static async updateScheduledAttendances(): Promise<void> {
    await AttendanceService.closeEndedScheduledAttendances();
    await AttendanceService.openScheduledAttendances();
  }

  /**
   * Closes every automatically opened attendance session whose meeting is no longer happening: it ended,
   * it was moved to a later time or to all day, or its event was deleted.
   */
  static async closeEndedScheduledAttendances(): Promise<void> {
    const now = new Date();

    const attendances = await prisma.meeting_Attendance.findMany({
      where: {
        closedAt: null,
        scheduleSlot: {
          OR: [
            { endTime: { lte: now } },
            { startTime: { gt: now } },
            { allDay: true },
            { event: { dateDeleted: { not: null } } }
          ]
        }
      },
      select: { meetingAttendanceId: true }
    });

    await AttendanceService.closeAttendances(attendances.map((attendance) => attendance.meetingAttendanceId));
  }

  /**
   * Opens attendance in each team's slack channel for every schedule slot that is currently happening
   * on an event whose event type takes attendance. Safe to run repeatedly, since a slot/team pair
   * only ever gets one attendance session.
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
        scheduleSlotId: true,
        event: {
          select: {
            eventId: true,
            title: true,
            userCreatedId: true,
            eventType: { select: { organizationId: true } },
            teams: { where: { dateArchived: null }, select: { teamId: true, slackId: true } }
          }
        },
        meetingAttendances: { select: { teamId: true } }
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

    for (const scheduleSlot of scheduleSlots) {
      const { event } = scheduleSlot;
      const teamsWithAttendance = new Set(scheduleSlot.meetingAttendances.map((attendance) => attendance.teamId));

      for (const team of event.teams) {
        if (teamsWithAttendance.has(team.teamId) || teamsWithOpenAttendance.has(team.teamId)) continue;

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
                scheduleSlotId: scheduleSlot.scheduleSlotId,
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

    if (openAttendance.scheduleSlotId !== null) {
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
