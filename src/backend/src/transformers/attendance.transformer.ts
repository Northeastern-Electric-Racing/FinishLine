import { Prisma } from '@prisma/client';
import { MeetingAttendance, MeetingAttendanceWithAttendees } from 'shared';
import {
  MeetingAttendanceQueryArgs,
  MeetingAttendanceWithAttendeesQueryArgs
} from '../prisma-query-args/attendance.query-args.js';
import { userTransformer } from './user.transformer.js';

export const meetingAttendanceTransformer = (
  attendance: Prisma.Meeting_AttendanceGetPayload<MeetingAttendanceQueryArgs>
): MeetingAttendance => {
  const teamMemberIds = new Set([
    ...attendance.team.members.map((m) => m.userId),
    ...attendance.team.leads.map((l) => l.userId),
    attendance.team.headId
  ]);
  const attendeeIds = new Set(attendance.attendees.map((a) => a.userId));
  const teamMemberAttendees = [...teamMemberIds].filter((id) => attendeeIds.has(id)).length;

  return {
    meetingAttendanceId: attendance.meetingAttendanceId,
    teamId: attendance.teamId,
    teamName: attendance.team.teamName,
    userCreated: userTransformer(attendance.userCreated),
    openedAt: attendance.openedAt,
    closedAt: attendance.closedAt ?? undefined,
    attendeesCount: attendance.attendees.length,
    teamMemberAttendancePercent: teamMemberIds.size > 0 ? (teamMemberAttendees / teamMemberIds.size) * 100 : 0
  };
};

export const meetingAttendanceWithAttendeesTransformer = (
  attendance: Prisma.Meeting_AttendanceGetPayload<MeetingAttendanceWithAttendeesQueryArgs>
): MeetingAttendanceWithAttendees => {
  const teamMemberIds = new Set([
    ...attendance.team.members.map((m) => m.userId),
    ...attendance.team.leads.map((l) => l.userId),
    attendance.team.headId
  ]);
  const attendeeIds = new Set(attendance.attendees.map((a) => a.userId));
  const teamMemberAttendees = [...teamMemberIds].filter((id) => attendeeIds.has(id)).length;

  return {
    meetingAttendanceId: attendance.meetingAttendanceId,
    teamId: attendance.teamId,
    teamName: attendance.team.teamName,
    userCreated: userTransformer(attendance.userCreated),
    openedAt: attendance.openedAt,
    closedAt: attendance.closedAt ?? undefined,
    attendeesCount: attendance.attendees.length,
    teamMemberAttendancePercent: teamMemberIds.size > 0 ? (teamMemberAttendees / teamMemberIds.size) * 100 : 0,
    attendees: attendance.attendees.map(userTransformer)
  };
};
