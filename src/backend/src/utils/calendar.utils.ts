import { Prisma } from '@prisma/client';

export function buildScheduledTimesOverlap(start?: Date, end?: Date): Prisma.ScheduleSlotListRelationFilter | undefined {
  if (!start && !end) return undefined;

  const AND: Prisma.ScheduleSlotWhereInput[] = [];
  if (end) AND.push({ initialDateScheduled: { lte: end } });
  if (start) AND.push({ endDate: { gte: start } });

  return { some: { AND } };
}
