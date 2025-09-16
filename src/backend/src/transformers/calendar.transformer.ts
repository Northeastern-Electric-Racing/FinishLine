import { Prisma } from '@prisma/client';
import { EventType } from 'shared';
import { EventTypeQueryArgs } from '../prisma-query-args/event-type.query-args';
import { userTransformer } from './user.transformer';

export const eventTypeTransformer = (eventType: Prisma.EventTypeGetPayload<EventTypeQueryArgs>): EventType => {
  return {
    eventTypeId: eventType.eventTypeId,
    name: eventType.name,
    userCreated: userTransformer(eventType.userCreated),
    dateCreated: eventType.dateCreated,
    initialDateScheduled: eventType.initialDateScheduled ?? undefined,
    allDay: eventType.allDay ?? undefined,
    recurring: eventType.recurring ?? undefined,
    members: eventType.members ?? undefined,
    location: eventType.location ?? undefined,
    zoomLink: eventType.zoomLink ?? undefined,
    availability: eventType.availabilities ?? undefined,
    shop: eventType.shop ?? undefined,
    machinery: eventType.machinery ?? undefined,
    workPackage: eventType.workPackage ?? undefined,
    questionDocument: eventType.questionDocument ?? undefined,
    documents: eventType.documents ?? undefined,
    description: eventType.description ?? undefined
  };
};
