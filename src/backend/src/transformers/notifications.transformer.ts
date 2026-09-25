import { Prisma } from '@prisma/client';

export const eventReminderInclude = {
  requiredMembers: { include: { userSettings: true } },
  optionalMembers: { include: { userSettings: true } },
  userCreated: { include: { userSettings: true } },
  teams: true,
  eventType: true,
  workPackages: { include: { wbsElement: true, project: { include: { teams: true } } } }
} satisfies Prisma.EventInclude;

export type EventForReminder = Prisma.EventGetPayload<{ include: typeof eventReminderInclude }>;