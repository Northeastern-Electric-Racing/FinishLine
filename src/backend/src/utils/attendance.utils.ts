/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

interface TeamRoster {
  headId: string;
  members: { userId: string }[];
  leads: { userId: string }[];
}

/**
 * Calculates what percentage of a team's roster (members, leads, and head) attended a meeting.
 *
 * @param team the team whose roster defines the denominator
 * @param attendees the users who attended the meeting
 * @returns the attendance percentage (0 - 100), or 0 if the team has no roster
 */
export const calculateTeamMemberAttendancePercent = (team: TeamRoster, attendees: { userId: string }[]): number => {
  const teamMemberIds = new Set([...team.members.map((m) => m.userId), ...team.leads.map((l) => l.userId), team.headId]);
  const attendeeIds = new Set(attendees.map((a) => a.userId));
  const teamMemberAttendees = [...teamMemberIds].filter((id) => attendeeIds.has(id)).length;
  return teamMemberIds.size > 0 ? (teamMemberAttendees / teamMemberIds.size) * 100 : 0;
};
