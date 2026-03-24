import { Organization } from '@prisma/client';
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
  editMessage,
  getChannelName,
  replyToMessageInThread,
  sendMessage
} from '../integrations/slack.js';
import { userHasPermission } from '../utils/users.utils.js';

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

    const teamMemberIds = new Set([
      ...attendance.team.members.map((m) => m.userId),
      ...attendance.team.leads.map((l) => l.userId),
      attendance.team.headId
    ]);
    const attendeeIds = new Set(attendance.attendees.map((a) => a.userId));
    const attendeesCount = attendance.attendees.length;
    const teamMemberAttendees = [...teamMemberIds].filter((id) => attendeeIds.has(id)).length;
    const teamMemberPercent = teamMemberIds.size > 0 ? (teamMemberAttendees / teamMemberIds.size) * 100 : 0;

    const closedMessage = `Attendance is now closed. ${attendeesCount} attended (${teamMemberPercent.toFixed(1)}% of team).`;
    await editMessage(attendance.slackChannelId, attendance.slackMessageTimestamp, closedMessage);

    await prisma.meeting_Attendance.update({
      where: { meetingAttendanceId },
      data: { closedAt: new Date() }
    });
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
