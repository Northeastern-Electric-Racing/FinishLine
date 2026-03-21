import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';

export type MeetingAttendanceQueryArgs = ReturnType<typeof getMeetingAttendanceQueryArgs>;

export const getMeetingAttendanceQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Meeting_AttendanceDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      team: {
        select: {
          teamId: true,
          teamName: true,
          headId: true,
          members: { select: { userId: true } },
          leads: { select: { userId: true } }
        }
      },
      attendees: { select: { userId: true } }
    }
  });
