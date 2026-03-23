import { User } from './user-types.js';

export interface MeetingAttendance {
  meetingAttendanceId: string;
  teamId: string;
  teamName: string;
  userCreated: User;
  openedAt: Date;
  closedAt?: Date;
  attendeesCount: number;
  teamMemberAttendancePercent: number;
}

export interface MeetingAttendanceWithAttendees extends MeetingAttendance {
  attendees: User[];
}
