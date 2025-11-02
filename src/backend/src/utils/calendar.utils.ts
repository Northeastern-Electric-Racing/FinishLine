import { Prisma } from '@prisma/client';
import { User, Event } from 'shared';

export function buildScheduledTimesOverlap(start?: Date, end?: Date): Prisma.ScheduleSlotListRelationFilter | undefined {
  if (!start && !end) return undefined;

  const AND: Prisma.ScheduleSlotWhereInput[] = [];
  if (end) AND.push({ initialDateScheduled: { lte: end } });
  if (start) AND.push({ endDate: { gte: start } });

  return { some: { AND } };
}

export const isUserOnEvent = (user: User, event: Event): boolean => {
  const requiredMembers = event.requiredMembers.map((user) => user.userId);
  const optionalMembers = event.optionalMembers.map((user) => user.userId);
  return requiredMembers.includes(user.userId) || optionalMembers.includes(user.userId);
};
