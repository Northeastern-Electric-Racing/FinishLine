import { Conflict_Status, Organization } from '@prisma/client';
import { vi } from 'vitest';
import AttendanceService from '../../src/services/attendance.services.js';
import { AccessDeniedException, HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import { batmanAppAdmin, supermanAdmin, greenlanternHead, wonderwomanGuest, member } from '../test-data/users.test-data.js';
import { createTestOrganization, createTestTeam, createTestTeamType, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import {
  sendMessage,
  editMessage,
  deleteMessage,
  replyToMessageInThread,
  getChannelName,
  checkBotInChannel
} from '../../src/integrations/slack.js';
import { Mock } from 'vitest';

vi.mock('../../src/integrations/slack.js', () => ({
  sendMessage: vi.fn(),
  editMessage: vi.fn(),
  deleteMessage: vi.fn(),
  replyToMessageInThread: vi.fn(),
  getChannelName: vi.fn(),
  checkBotInChannel: vi.fn()
}));

// Creates a second test org with distinct credentials (since createTestOrganization uses a hardcoded empty email)
const createOtherOrganization = async () => {
  const user = await prisma.user.create({
    data: { firstName: 'Other', lastName: 'Creator', email: 'other-org-creator@test.com', googleAuthId: 'otherOrgCreator' }
  });
  return prisma.organization.create({
    data: { name: 'Other Org', description: '', applicationLink: '', userCreated: { connect: { userId: user.userId } } }
  });
};

// Creates a team with a team type properly scoped to orgId.
// (createTestTeam(head, undefined, orgId) incorrectly passes orgId as the team type name.)
const createTeamInOrg = async (headId: string, teamOrgId: string) => {
  const teamType = await createTestTeamType('aTeam', teamOrgId);
  return createTestTeam(headId, teamType.teamTypeId, teamOrgId);
};

// Creates a scheduled event on an attendance-taking event type, with one schedule slot and the given teams
const createAttendanceEvent = async (
  creatorId: string,
  eventOrgId: string,
  teamIds: string[],
  startTime: Date,
  endTime: Date,
  takeAttendance = true,
  approved: Conflict_Status = Conflict_Status.NO_CONFLICT
) => {
  const eventType = await prisma.event_Type.create({
    data: {
      name: 'Team Meeting',
      userCreatedId: creatorId,
      organizationId: eventOrgId,
      requiredMembers: false,
      optionalMembers: false,
      teams: true,
      teamType: false,
      location: false,
      zoomLink: false,
      shop: false,
      machinery: false,
      workPackage: false,
      questionDocument: false,
      documents: false,
      description: false,
      onlyHeadsOrAboveForEventCreation: false,
      requiresConfirmation: false,
      sendSlackNotifications: false,
      takeAttendance
    }
  });

  return prisma.event.create({
    data: {
      title: 'Weekly Meeting',
      userCreatedId: creatorId,
      eventTypeId: eventType.eventTypeId,
      approved,
      status: 'SCHEDULED',
      teams: { connect: teamIds.map((teamId) => ({ teamId })) },
      scheduledTimes: { create: { startTime, endTime } }
    },
    include: { scheduledTimes: true }
  });
};

describe('Attendance Tests', () => {
  let organization: Organization;
  let orgId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('takeAttendance', () => {
    it('throws NotFoundException if team does not exist', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        AttendanceService.takeAttendance(admin as any, 'nonexistent-team-id', 'Please react!', organization)
      ).rejects.toThrow(new NotFoundException('Team', 'nonexistent-team-id'));
    });

    it('throws NotFoundException if team belongs to a different organization', async () => {
      const otherOrg = await createOtherOrganization();
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const otherAdmin = await createTestUser({ ...supermanAdmin, googleAuthId: 'otherAdmin' }, otherOrg.organizationId);
      const team = await createTeamInOrg(otherAdmin.userId, otherOrg.organizationId);

      await expect(
        AttendanceService.takeAttendance(admin as any, team.teamId, 'Please react!', organization)
      ).rejects.toThrow(new NotFoundException('Team', team.teamId));
    });

    it('throws AccessDeniedException if user is not team head or admin', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const regularMember = await createTestUser({ ...member, googleAuthId: 'regularMember' }, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await expect(
        AttendanceService.takeAttendance(regularMember as any, team.teamId, 'Please react!', organization)
      ).rejects.toThrow(new AccessDeniedException('Only team heads or admins can take attendance'));
    });

    it('throws HttpException if there is already an open attendance session', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '1234567890.000001'
        }
      });

      await expect(
        AttendanceService.takeAttendance(head as any, team.teamId, 'Please react!', organization)
      ).rejects.toThrow(new HttpException(400, 'There is already an open attendance session for this team'));
    });

    it('throws HttpException if Slack message fails to send', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      (sendMessage as Mock).mockResolvedValue(null);

      await expect(
        AttendanceService.takeAttendance(head as any, team.teamId, 'Please react!', organization)
      ).rejects.toThrow(
        new HttpException(
          500,
          'Failed to send Slack message. Check that the team Slack ID is valid and the bot is in the channel.'
        )
      );
    });

    it('succeeds and creates an attendance record when called by team head', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      (sendMessage as Mock).mockResolvedValue({ channelId: 'C12345', ts: '1234567890.000001' });

      const result = await AttendanceService.takeAttendance(head as any, team.teamId, 'Please react!', organization);

      expect(result.teamId).toBe(team.teamId);
      expect(result.closedAt).toBeUndefined();
      expect(result.attendeesCount).toBe(0);

      const record = await prisma.meeting_Attendance.findFirst({ where: { teamId: team.teamId } });
      expect(record).not.toBeNull();
      expect(record!.slackChannelId).toBe('C12345');
      expect(record!.slackMessageTimestamp).toBe('1234567890.000001');
    });

    it('succeeds and creates an attendance record when called by admin', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      (sendMessage as Mock).mockResolvedValue({ channelId: 'C99999', ts: '9999999999.000001' });

      const result = await AttendanceService.takeAttendance(admin as any, team.teamId, 'Attend please!', organization);

      expect(result.teamId).toBe(team.teamId);
      expect(result.userCreated.userId).toBe(admin.userId);
    });
  });

  describe('getAllAttendances', () => {
    it('returns empty array when no attendances exist', async () => {
      const result = await AttendanceService.getAllAttendances(organization);
      expect(result).toEqual([]);
    });

    it('returns all attendance records for the organization', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001'
        }
      });
      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '222.002',
          closedAt: new Date()
        }
      });

      const result = await AttendanceService.getAllAttendances(organization);
      expect(result).toHaveLength(2);
    });

    it('does not return attendance records from other organizations', async () => {
      const otherOrg = await createOtherOrganization();
      const head = await createTestUser({ ...greenlanternHead, googleAuthId: 'otherHead' }, otherOrg.organizationId);
      const team = await createTeamInOrg(head.userId, otherOrg.organizationId);

      await prisma.meeting_Attendance.create({
        data: {
          organizationId: otherOrg.organizationId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001'
        }
      });

      const result = await AttendanceService.getAllAttendances(organization);
      expect(result).toHaveLength(0);
    });
  });

  describe('getOngoingAttendance', () => {
    it('throws NotFoundException if team does not exist', async () => {
      await expect(AttendanceService.getOngoingAttendance('nonexistent-team-id', organization)).rejects.toThrow(
        new NotFoundException('Team', 'nonexistent-team-id')
      );
    });

    it('throws NotFoundException if team belongs to different organization', async () => {
      const otherOrg = await createOtherOrganization();
      const head = await createTestUser({ ...greenlanternHead, googleAuthId: 'otherHead' }, otherOrg.organizationId);
      const team = await createTeamInOrg(head.userId, otherOrg.organizationId);

      await expect(AttendanceService.getOngoingAttendance(team.teamId, organization)).rejects.toThrow(
        new NotFoundException('Team', team.teamId)
      );
    });

    it('returns null if there is no ongoing attendance', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      const result = await AttendanceService.getOngoingAttendance(team.teamId, organization);
      expect(result).toBeNull();
    });

    it('returns null if the only attendance session is already closed', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001',
          closedAt: new Date()
        }
      });

      const result = await AttendanceService.getOngoingAttendance(team.teamId, organization);
      expect(result).toBeNull();
    });

    it('returns the ongoing attendance session', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001'
        }
      });

      const result = await AttendanceService.getOngoingAttendance(team.teamId, organization);
      expect(result).not.toBeNull();
      expect(result!.teamId).toBe(team.teamId);
      expect(result!.closedAt).toBeUndefined();
    });
  });

  describe('closeOngoingAttendance', () => {
    it('throws HttpException if the open session was opened automatically for a meeting', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      const event = await createAttendanceEvent(
        head.userId,
        orgId,
        [team.teamId],
        new Date(now - 60 * 60 * 1000),
        new Date(now + 60 * 60 * 1000)
      );
      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001',
          scheduleSlotId: event.scheduledTimes[0].scheduleSlotId
        }
      });

      await expect(AttendanceService.closeOngoingAttendance(team.teamId, head, organization)).rejects.toThrow(
        new HttpException(
          400,
          'This attendance session was opened automatically for a meeting and will close when the meeting ends'
        )
      );
      expect(editMessage).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if team does not exist', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        AttendanceService.closeOngoingAttendance('nonexistent-team-id', admin as any, organization)
      ).rejects.toThrow(new NotFoundException('Team', 'nonexistent-team-id'));
    });

    it('throws NotFoundException if team belongs to a different organization', async () => {
      const otherOrg = await createOtherOrganization();
      const head = await createTestUser({ ...greenlanternHead, googleAuthId: 'otherHead' }, otherOrg.organizationId);
      const team = await createTeamInOrg(head.userId, otherOrg.organizationId);
      const admin = await createTestUser(batmanAppAdmin, orgId);

      await expect(AttendanceService.closeOngoingAttendance(team.teamId, admin as any, organization)).rejects.toThrow(
        new NotFoundException('Team', team.teamId)
      );
    });

    it('throws AccessDeniedException if user is not team head or admin', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const regularMember = await createTestUser({ ...member, googleAuthId: 'regularMember' }, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001'
        }
      });

      await expect(
        AttendanceService.closeOngoingAttendance(team.teamId, regularMember as any, organization)
      ).rejects.toThrow(new AccessDeniedException('Only team heads or admins can close attendance'));
    });

    it('throws HttpException if there is no open attendance session', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await expect(AttendanceService.closeOngoingAttendance(team.teamId, head as any, organization)).rejects.toThrow(
        new HttpException(400, 'There is no open attendance session for this team')
      );
    });

    it('succeeds and closes the ongoing attendance when called by team head', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001'
        }
      });

      (editMessage as Mock).mockResolvedValue(undefined);

      await AttendanceService.closeOngoingAttendance(team.teamId, head as any, organization);

      const record = await prisma.meeting_Attendance.findFirst({ where: { teamId: team.teamId } });
      expect(record!.closedAt).not.toBeNull();
    });

    it('succeeds and closes the ongoing attendance when called by admin', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001'
        }
      });

      (editMessage as Mock).mockResolvedValue(undefined);

      await AttendanceService.closeOngoingAttendance(team.teamId, admin as any, organization);

      const record = await prisma.meeting_Attendance.findFirst({ where: { teamId: team.teamId } });
      expect(record!.closedAt).not.toBeNull();
    });
  });

  describe('closeAttendance', () => {
    it('returns early if attendance does not exist', async () => {
      await expect(AttendanceService.closeAttendance('nonexistent-id')).resolves.toBeUndefined();
      expect(editMessage).not.toHaveBeenCalled();
    });

    it('returns early if attendance is already closed', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      const attendance = await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001',
          closedAt: new Date()
        }
      });

      await AttendanceService.closeAttendance(attendance.meetingAttendanceId);
      expect(editMessage).not.toHaveBeenCalled();
    });

    it('closes the attendance and edits the Slack message with summary', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const attendee = await createTestUser({ ...wonderwomanGuest, googleAuthId: 'attendeeUser' }, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.team.update({
        where: { teamId: team.teamId },
        data: { members: { connect: { userId: attendee.userId } } }
      });

      const attendance = await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001',
          attendees: { connect: { userId: attendee.userId } }
        }
      });

      (editMessage as Mock).mockResolvedValue(undefined);

      await AttendanceService.closeAttendance(attendance.meetingAttendanceId);

      const record = await prisma.meeting_Attendance.findUnique({
        where: { meetingAttendanceId: attendance.meetingAttendanceId }
      });
      expect(record!.closedAt).not.toBeNull();
      expect(editMessage).toHaveBeenCalledWith('C12345', '111.001', expect.stringContaining('Attendance is now closed.'));
    });

    it('calculates correct attendance percentage', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const member1 = await createTestUser({ ...member, googleAuthId: 'member1' }, orgId);
      const member2 = await createTestUser({ ...wonderwomanGuest, googleAuthId: 'member2' }, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.team.update({
        where: { teamId: team.teamId },
        data: { members: { connect: [{ userId: member1.userId }, { userId: member2.userId }] } }
      });

      // Only member1 and head attended (2 out of 3 team members)
      const attendance = await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001',
          attendees: { connect: [{ userId: head.userId }, { userId: member1.userId }] }
        }
      });

      (editMessage as Mock).mockResolvedValue(undefined);

      await AttendanceService.closeAttendance(attendance.meetingAttendanceId);

      // 2 attendees / 3 team members = 66.7%
      expect(editMessage).toHaveBeenCalledWith('C12345', '111.001', expect.stringContaining('66.7% of team'));
    });
  });

  describe('openScheduledAttendances', () => {
    const hourMs = 60 * 60 * 1000;

    it('opens attendance with @channel for each team on an ongoing event', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      const event = await createAttendanceEvent(
        head.userId,
        orgId,
        [team.teamId],
        new Date(now - hourMs),
        new Date(now + hourMs)
      );

      (sendMessage as Mock).mockResolvedValue({ channelId: 'C12345', ts: '111.001' });

      await AttendanceService.openScheduledAttendances();

      expect(sendMessage).toHaveBeenCalledWith(team.slackId, expect.stringContaining('<!channel>'));
      const attendances = await prisma.meeting_Attendance.findMany({ where: { teamId: team.teamId } });
      expect(attendances).toHaveLength(1);
      expect(attendances[0].scheduleSlotId).toBe(event.scheduledTimes[0].scheduleSlotId);
      expect(attendances[0].closedAt).toBeNull();
    });

    it('schedules attendance to close when the meeting ends', async () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(head.userId, orgId, [team.teamId], new Date(now - hourMs), new Date(now + hourMs));

      (sendMessage as Mock).mockResolvedValue({ channelId: 'C12345', ts: '111.001' });

      await AttendanceService.openScheduledAttendances();

      const closeTimers = setTimeoutSpy.mock.calls.filter(
        ([, delay]) => delay !== undefined && delay > hourMs - 60 * 1000 && delay <= hourMs
      );
      expect(closeTimers).toHaveLength(1);
      setTimeoutSpy.mockRestore();
    });

    it('does not open attendance for events still waiting on conflict approval', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(
        head.userId,
        orgId,
        [team.teamId],
        new Date(now - hourMs),
        new Date(now + hourMs),
        true,
        Conflict_Status.PENDING
      );

      await AttendanceService.openScheduledAttendances();

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('keeps opening attendance for other teams when one team fails', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const otherHead = await createTestUser({ ...supermanAdmin, googleAuthId: 'otherTeamHead' }, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const otherTeam = await createTeamInOrg(otherHead.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(
        head.userId,
        orgId,
        [team.teamId, otherTeam.teamId],
        new Date(now - hourMs),
        new Date(now + hourMs)
      );

      (sendMessage as Mock)
        .mockRejectedValueOnce(new Error('Slack is down'))
        .mockResolvedValueOnce({ channelId: 'C67890', ts: '111.002' });

      await AttendanceService.openScheduledAttendances();

      expect(sendMessage).toHaveBeenCalledTimes(2);
      const attendances = await prisma.meeting_Attendance.findMany({ where: { closedAt: null } });
      expect(attendances).toHaveLength(1);
    });

    it('deletes the slack message if the attendance session cannot be saved', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(head.userId, orgId, [team.teamId], new Date(now - hourMs), new Date(now + hourMs));

      (sendMessage as Mock).mockResolvedValue({ channelId: 'C12345', ts: '111.001' });
      const createSpy = vi
        .spyOn(prisma.meeting_Attendance, 'create')
        .mockRejectedValueOnce(new Error('Unique constraint failed'));

      await AttendanceService.openScheduledAttendances();

      expect(deleteMessage).toHaveBeenCalledWith('C12345', '111.001');
      createSpy.mockRestore();
    });

    it('splits close timers longer than the setTimeout limit', async () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(
        head.userId,
        orgId,
        [team.teamId],
        new Date(now - hourMs),
        new Date(now + 30 * 24 * hourMs)
      );

      (sendMessage as Mock).mockResolvedValue({ channelId: 'C12345', ts: '111.001' });

      await AttendanceService.openScheduledAttendances();

      expect(setTimeoutSpy.mock.calls.some(([, delay]) => delay === 2 ** 31 - 1)).toBe(true);
      setTimeoutSpy.mockRestore();
    });

    it('only opens attendance once per schedule slot', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(head.userId, orgId, [team.teamId], new Date(now - hourMs), new Date(now + hourMs));

      (sendMessage as Mock).mockResolvedValue({ channelId: 'C12345', ts: '111.001' });

      await AttendanceService.openScheduledAttendances();
      await prisma.meeting_Attendance.updateMany({ data: { closedAt: new Date() } });
      await AttendanceService.openScheduledAttendances();

      expect(sendMessage).toHaveBeenCalledTimes(1);
    });

    it('does not open attendance for events that have not started', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(head.userId, orgId, [team.teamId], new Date(now + hourMs), new Date(now + 2 * hourMs));

      await AttendanceService.openScheduledAttendances();

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('does not open attendance for event types that do not take attendance', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(head.userId, orgId, [team.teamId], new Date(now - hourMs), new Date(now + hourMs), false);

      await AttendanceService.openScheduledAttendances();

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('skips a team that already has an open attendance session', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(head.userId, orgId, [team.teamId], new Date(now - hourMs), new Date(now + hourMs));
      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '000.001'
        }
      });

      await AttendanceService.openScheduledAttendances();

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('opens attendance for different teams meeting at the same time', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const otherHead = await createTestUser({ ...supermanAdmin, googleAuthId: 'otherTeamHead' }, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const otherTeam = await createTeamInOrg(otherHead.userId, orgId);
      const now = Date.now();
      await createAttendanceEvent(head.userId, orgId, [team.teamId], new Date(now - hourMs), new Date(now + hourMs));
      await createAttendanceEvent(
        otherHead.userId,
        orgId,
        [otherTeam.teamId],
        new Date(now - hourMs),
        new Date(now + hourMs)
      );

      (sendMessage as Mock)
        .mockResolvedValueOnce({ channelId: 'C12345', ts: '111.001' })
        .mockResolvedValueOnce({ channelId: 'C67890', ts: '111.002' });

      await AttendanceService.openScheduledAttendances();

      expect(sendMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('schedule slot changes', () => {
    const hourMs = 60 * 60 * 1000;

    const createOpenAutomaticAttendance = async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const now = Date.now();
      const event = await createAttendanceEvent(
        head.userId,
        orgId,
        [team.teamId],
        new Date(now - hourMs),
        new Date(now + hourMs)
      );
      const [scheduleSlot] = event.scheduledTimes;
      const attendance = await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001',
          scheduleSlotId: scheduleSlot.scheduleSlotId
        }
      });
      return { event, scheduleSlot, attendance };
    };

    const getClosedAt = async (meetingAttendanceId: string) =>
      (await prisma.meeting_Attendance.findUnique({ where: { meetingAttendanceId } }))!.closedAt;

    it('closes attendance when its slot is moved so the meeting is no longer happening', async () => {
      const { scheduleSlot, attendance } = await createOpenAutomaticAttendance();
      const now = Date.now();
      await prisma.schedule_Slot.update({
        where: { scheduleSlotId: scheduleSlot.scheduleSlotId },
        data: { startTime: new Date(now + hourMs), endTime: new Date(now + 2 * hourMs) }
      });

      await AttendanceService.syncAttendancesForScheduleSlots([scheduleSlot.scheduleSlotId]);

      expect(await getClosedAt(attendance.meetingAttendanceId)).not.toBeNull();
    });

    it('moves the close timer when the meeting is extended', async () => {
      const { scheduleSlot, attendance } = await createOpenAutomaticAttendance();
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      await prisma.schedule_Slot.update({
        where: { scheduleSlotId: scheduleSlot.scheduleSlotId },
        data: { endTime: new Date(Date.now() + 3 * hourMs) }
      });

      await AttendanceService.syncAttendancesForScheduleSlots([scheduleSlot.scheduleSlotId]);

      expect(await getClosedAt(attendance.meetingAttendanceId)).toBeNull();
      const closeTimers = setTimeoutSpy.mock.calls.filter(
        ([, delay]) => delay !== undefined && delay > 3 * hourMs - 60 * 1000 && delay <= 3 * hourMs
      );
      expect(closeTimers).toHaveLength(1);
      setTimeoutSpy.mockRestore();
    });

    it('closes attendance for a slot that is about to be deleted', async () => {
      const { scheduleSlot, attendance } = await createOpenAutomaticAttendance();

      await AttendanceService.closeAttendancesForScheduleSlots([scheduleSlot.scheduleSlotId]);

      expect(await getClosedAt(attendance.meetingAttendanceId)).not.toBeNull();
    });

    it('closes attendance when its event is deleted', async () => {
      const { event, attendance } = await createOpenAutomaticAttendance();

      await AttendanceService.closeAttendancesForEvent(event.eventId);

      expect(await getClosedAt(attendance.meetingAttendanceId)).not.toBeNull();
    });

    it('moves attendance onto the new slot when the event is rescheduled', async () => {
      const { event, attendance } = await createOpenAutomaticAttendance();
      const now = Date.now();
      const newSlot = await prisma.schedule_Slot.create({
        data: { eventId: event.eventId, startTime: new Date(now - hourMs / 2), endTime: new Date(now + hourMs) }
      });

      await AttendanceService.moveAttendancesToScheduleSlot([attendance.meetingAttendanceId], newSlot.scheduleSlotId);

      const record = await prisma.meeting_Attendance.findUnique({
        where: { meetingAttendanceId: attendance.meetingAttendanceId }
      });
      expect(record!.scheduleSlotId).toBe(newSlot.scheduleSlotId);
      expect(record!.closedAt).toBeNull();
    });
  });

  describe('resumeScheduledAttendances', () => {
    const hourMs = 60 * 60 * 1000;

    const createAutomaticAttendance = async (startTime: Date, endTime: Date) => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const event = await createAttendanceEvent(head.userId, orgId, [team.teamId], startTime, endTime);
      return prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001',
          scheduleSlotId: event.scheduledTimes[0].scheduleSlotId
        }
      });
    };

    it('closes automatic sessions whose meeting already ended', async () => {
      const now = Date.now();
      const attendance = await createAutomaticAttendance(new Date(now - 2 * hourMs), new Date(now - hourMs));

      await AttendanceService.resumeScheduledAttendances();

      const record = await prisma.meeting_Attendance.findUnique({
        where: { meetingAttendanceId: attendance.meetingAttendanceId }
      });
      expect(record!.closedAt).not.toBeNull();
      expect(editMessage).toHaveBeenCalledWith('C12345', '111.001', expect.stringContaining('Attendance is now closed.'));
    });

    it('sets the close timer again for sessions whose meeting is still ongoing', async () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      const now = Date.now();
      const attendance = await createAutomaticAttendance(new Date(now - hourMs), new Date(now + hourMs));

      await AttendanceService.resumeScheduledAttendances();

      const record = await prisma.meeting_Attendance.findUnique({
        where: { meetingAttendanceId: attendance.meetingAttendanceId }
      });
      expect(record!.closedAt).toBeNull();
      const closeTimers = setTimeoutSpy.mock.calls.filter(
        ([, delay]) => delay !== undefined && delay > hourMs - 60 * 1000 && delay <= hourMs
      );
      expect(closeTimers).toHaveLength(1);
      setTimeoutSpy.mockRestore();
    });

    it('leaves manual sessions alone', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);
      const attendance = await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001'
        }
      });

      await AttendanceService.resumeScheduledAttendances();

      const record = await prisma.meeting_Attendance.findUnique({
        where: { meetingAttendanceId: attendance.meetingAttendanceId }
      });
      expect(record!.closedAt).toBeNull();
    });
  });

  describe('handleReactionAdded', () => {
    it('returns early if no matching open attendance exists', async () => {
      await AttendanceService.handleReactionAdded('slackUser1', 'C99999', 'nonexistent.ts');
      expect(replyToMessageInThread).not.toHaveBeenCalled();
    });

    it('posts a thread message if the Slack user is not linked to a FinishLine account', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001'
        }
      });

      (replyToMessageInThread as Mock).mockResolvedValue(undefined);

      await AttendanceService.handleReactionAdded('unknownSlackId', 'C12345', '111.001');

      expect(replyToMessageInThread).toHaveBeenCalledWith('C12345', '111.001', expect.stringContaining('unknownSlackId'));
    });

    it('records attendance when a linked user reacts', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const attendee = await createTestUser({ ...wonderwomanGuest, googleAuthId: 'attendeeUser' }, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      await prisma.user_Settings.create({
        data: { userId: attendee.userId, slackId: 'slackWW123' }
      });

      const attendance = await prisma.meeting_Attendance.create({
        data: {
          organizationId: orgId,
          teamId: team.teamId,
          userCreatedId: head.userId,
          slackChannelId: 'C12345',
          slackMessageTimestamp: '111.001'
        }
      });

      await AttendanceService.handleReactionAdded('slackWW123', 'C12345', '111.001');

      const updated = await prisma.meeting_Attendance.findUnique({
        where: { meetingAttendanceId: attendance.meetingAttendanceId },
        include: { attendees: true }
      });
      expect(updated!.attendees).toHaveLength(1);
      expect(updated!.attendees[0].userId).toBe(attendee.userId);
      expect(replyToMessageInThread).not.toHaveBeenCalled();
    });
  });

  describe('checkTeamChannel', () => {
    it('throws NotFoundException if team does not exist', async () => {
      await expect(AttendanceService.checkTeamChannel('nonexistent-team-id', organization)).rejects.toThrow(
        new NotFoundException('Team', 'nonexistent-team-id')
      );
    });

    it('throws NotFoundException if team belongs to a different organization', async () => {
      const otherOrg = await createOtherOrganization();
      const head = await createTestUser({ ...greenlanternHead, googleAuthId: 'otherHead' }, otherOrg.organizationId);
      const team = await createTeamInOrg(head.userId, otherOrg.organizationId);

      await expect(AttendanceService.checkTeamChannel(team.teamId, organization)).rejects.toThrow(
        new NotFoundException('Team', team.teamId)
      );
    });

    it('returns valid: false if Slack channel is not found', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      (getChannelName as Mock).mockResolvedValue(undefined);

      const result = await AttendanceService.checkTeamChannel(team.teamId, organization);

      expect(result.valid).toBe(false);
      expect(result.channelName).toBeUndefined();
    });

    it('returns valid: false if Slack channel is found but bot is not a member', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      (getChannelName as Mock).mockResolvedValue('ner-software');
      (checkBotInChannel as Mock).mockResolvedValue(false);

      const result = await AttendanceService.checkTeamChannel(team.teamId, organization);

      expect(result.valid).toBe(false);
      expect(result.channelName).toBe('ner-software');
    });

    it('returns valid: true with channel name if Slack channel is found and bot is a member', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const team = await createTeamInOrg(head.userId, orgId);

      (getChannelName as Mock).mockResolvedValue('ner-software');
      (checkBotInChannel as Mock).mockResolvedValue(true);

      const result = await AttendanceService.checkTeamChannel(team.teamId, organization);

      expect(result.valid).toBe(true);
      expect(result.channelName).toBe('ner-software');
    });
  });
});
