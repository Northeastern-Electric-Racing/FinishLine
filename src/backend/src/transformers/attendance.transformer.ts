import { Prisma } from '@prisma/client';
import { MeetingAttendance, MeetingAttendanceWithAttendees } from 'shared';
import {
  MeetingAttendanceQueryArgs,
  MeetingAttendanceWithAttendeesQueryArgs
} from '../prisma-query-args/attendance.query-args.js';
import { userTransformer } from './user.transformer.js';
import { calculateTeamMemberAttendancePercent } from '../utils/attendance.utils.js';

export const meetingAttendanceTransformer = (
  attendance: Prisma.Meeting_AttendanceGetPayload<MeetingAttendanceQueryArgs>
): MeetingAttendance => {
  return {
    meetingAttendanceId: attendance.meetingAttendanceId,
    teamId: attendance.teamId,
    teamName: attendance.team.teamName,
    userCreated: userTransformer(attendance.userCreated),
    openedAt: attendance.openedAt,
    closedAt: attendance.closedAt ?? undefined,
    attendeesCount: attendance.attendees.length,
    teamMemberAttendancePercent: calculateTeamMemberAttendancePercent(attendance.team, attendance.attendees)
  };
};

export const meetingAttendanceWithAttendeesTransformer = (
  attendance: Prisma.Meeting_AttendanceGetPayload<MeetingAttendanceWithAttendeesQueryArgs>
): MeetingAttendanceWithAttendees => {
  return {
    meetingAttendanceId: attendance.meetingAttendanceId,
    teamId: attendance.teamId,
    teamName: attendance.team.teamName,
    userCreated: userTransformer(attendance.userCreated),
    openedAt: attendance.openedAt,
    closedAt: attendance.closedAt ?? undefined,
    attendeesCount: attendance.attendees.length,
    teamMemberAttendancePercent: calculateTeamMemberAttendancePercent(attendance.team, attendance.attendees),
    attendees: attendance.attendees.map(userTransformer)
  };
};
