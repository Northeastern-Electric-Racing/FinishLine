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

// Node's setTimeout can't wait longer than this (about 24.8 days)
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

// Close timers for automatically opened attendance sessions, keyed by meetingAttendanceId, so they can be moved or
// cancelled when the meeting's schedule slot changes
const closeTimers = new Map<string, NodeJS.Timeout>();

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
    AttendanceService.clearScheduledClose(meetingAttendanceId);

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
   * Sets (or replaces) the timer that closes an automatically opened attendance session at the given time.
   * Node can't wait longer than MAX_TIMEOUT_MS in one timer, so longer waits are split across several.
   *
   * @param meetingAttendanceId the attendance session to close
   * @param closeAt when the session should close
   */
  static scheduleClose(meetingAttendanceId: string, closeAt: Date): void {
    AttendanceService.clearScheduledClose(meetingAttendanceId);

    const delay = Math.max(closeAt.getTime() - Date.now(), 0);
    const timer = setTimeout(
      () => {
        closeTimers.delete(meetingAttendanceId);
        if (delay > MAX_TIMEOUT_MS) {
          AttendanceService.scheduleClose(meetingAttendanceId, closeAt);
          return;
        }
        AttendanceService.closeAttendance(meetingAttendanceId).catch((error: unknown) =>
          console.error(`Failed to close attendance ${meetingAttendanceId}:`, error)
        );
      },
      Math.min(delay, MAX_TIMEOUT_MS)
    );

    closeTimers.set(meetingAttendanceId, timer);
  }

  /**
   * Cancels the close timer for an attendance session, if it has one.
   *
   * @param meetingAttendanceId the attendance session whose timer should be cancelled
   */
  static clearScheduledClose(meetingAttendanceId: string): void {
    const timer = closeTimers.get(meetingAttendanceId);
    if (timer !== undefined) {
      clearTimeout(timer);
      closeTimers.delete(meetingAttendanceId);
    }
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
   * deleted, since deleting a slot unlinks its sessions.
   *
   * @param scheduleSlotIds the schedule slots being removed
   */
  static async closeAttendancesForScheduleSlots(scheduleSlotIds: string[]): Promise<void> {
    await AttendanceService.closeAttendances(await AttendanceService.getOpenAttendanceIdsForScheduleSlots(scheduleSlotIds));
  }

  /**
   * Closes the open attendance sessions for every schedule slot of an event, e.g. when the event is deleted.
   *
   * @param eventId the event whose attendance sessions should close
   */
  static async closeAttendancesForEvent(eventId: string): Promise<void> {
    const attendances = await prisma.meeting_Attendance.findMany({
      where: { scheduleSlot: { eventId }, closedAt: null },
      select: { meetingAttendanceId: true }
    });
    await AttendanceService.closeAttendances(attendances.map((attendance) => attendance.meetingAttendanceId));
  }

  /**
   * Brings the open attendance sessions for the given schedule slots in line with the slots' current times
   * after they were edited. Sessions whose meeting is no longer happening are closed, and the rest have
   * their close timer moved to the slot's new end time.
   *
   * @param scheduleSlotIds the schedule slots that were edited
   */
  static async syncAttendancesForScheduleSlots(scheduleSlotIds: string[]): Promise<void> {
    const now = new Date();

    const attendances = await prisma.meeting_Attendance.findMany({
      where: { scheduleSlotId: { in: scheduleSlotIds }, closedAt: null },
      include: { scheduleSlot: { select: { startTime: true, endTime: true, allDay: true } } }
    });

    const attendanceIdsToClose: string[] = [];
    for (const attendance of attendances) {
      const { scheduleSlot } = attendance;
      if (scheduleSlot === null || scheduleSlot.allDay || scheduleSlot.startTime > now || scheduleSlot.endTime <= now) {
        attendanceIdsToClose.push(attendance.meetingAttendanceId);
      } else {
        AttendanceService.scheduleClose(attendance.meetingAttendanceId, scheduleSlot.endTime);
      }
    }

    await AttendanceService.closeAttendances(attendanceIdsToClose);
  }

  /**
   * Moves open attendance sessions onto a new schedule slot, used when an event is rescheduled and its old
   * slots are replaced, so the meeting keeps its attendance session instead of getting a second one.
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

    await AttendanceService.syncAttendancesForScheduleSlots([scheduleSlotId]);
  }

  /**
   * Recovers automatically opened attendance sessions after a server restart, since their close timers
   * only live in memory. Sessions whose meeting has already ended are closed, and the rest get their
   * close timer set again for when the meeting ends.
   */
  static async resumeScheduledAttendances(): Promise<void> {
    const now = new Date();

    const attendances = await prisma.meeting_Attendance.findMany({
      where: { closedAt: null, scheduleSlotId: { not: null } },
      include: { scheduleSlot: { select: { endTime: true } } }
    });

    const attendanceIdsToClose: string[] = [];
    for (const attendance of attendances) {
      if (attendance.scheduleSlot === null || attendance.scheduleSlot.endTime <= now) {
        attendanceIdsToClose.push(attendance.meetingAttendanceId);
      } else {
        AttendanceService.scheduleClose(attendance.meetingAttendanceId, attendance.scheduleSlot.endTime);
      }
    }

    await AttendanceService.closeAttendances(attendanceIdsToClose);
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
      include: {
        event: { include: { teams: true, eventType: { select: { organizationId: true } } } },
        meetingAttendances: { select: { teamId: true } }
      }
    });

    for (const scheduleSlot of scheduleSlots) {
      const { event } = scheduleSlot;
      const teamsWithAttendance = new Set(scheduleSlot.meetingAttendances.map((attendance) => attendance.teamId));

      for (const team of event.teams) {
        if (teamsWithAttendance.has(team.teamId) || team.dateArchived !== null) continue;

        try {
          // A team can only have one open attendance session at a time, so wait for its current one to close.
          // Different teams can still take attendance at the same time.
          const openAttendance = await prisma.meeting_Attendance.findFirst({
            where: { teamId: team.teamId, closedAt: null }
          });
          if (openAttendance !== null) continue;

          const result = await sendMessage(
            team.slackId,
            `<!channel> Please react to this message to confirm your attendance at ${event.title}!`
          );
          if (!result) {
            console.error(`Failed to send attendance message for event ${event.eventId} to team ${team.teamId}`);
            continue;
          }

          const attendance = await prisma.meeting_Attendance
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

          // Attendance stays open for as long as the meeting is scheduled
          AttendanceService.scheduleClose(attendance.meetingAttendanceId, scheduleSlot.endTime);
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
