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
    initialDateScheduled: eventType.initialDateScheduled,
    allDay: eventType.allDay,
    recurring: eventType.recurring,
    members: eventType.members,
    location: eventType.location,
    zoomLink: eventType.zoomLink,
    availability: eventType.availabilities,
    shop: eventType.shop,
    machinery: eventType.machinery,
    workPackage: eventType.workPackage,
    questionDocument: eventType.questionDocument,
    documents: eventType.documents,
    description: eventType.description
  };
};
