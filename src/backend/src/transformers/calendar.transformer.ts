import { Prisma } from '@prisma/client';
import { EventType } from 'shared';

export const eventTypeTransformer = (eventType: Prisma.EventTypeGetPayload<null>): EventType => {
  return {
    name: eventType.name
  };
};
