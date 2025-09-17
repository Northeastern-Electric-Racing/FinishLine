import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type EventTypeQueryArgs = ReturnType<typeof getEventTypeQueryArgs>;

export const getEventTypeQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.EventTypeDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId)
    }
  });
