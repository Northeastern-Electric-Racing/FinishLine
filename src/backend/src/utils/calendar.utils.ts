import { Prisma, Event_Type, Organization } from '@prisma/client';
import { User, ScheduleSlotCreateArgs, EventDocumentCreateArgs, Document, ConflictStatus, Event } from 'shared';
import { InvalidEventTypeConfigurationException } from './errors.utils';
import prisma from '../prisma/prisma';
import { getEventQueryArgs } from '../prisma-query-args/event.query-args';
import { eventTransformer } from '../transformers/calendar.transformer';

export function buildScheduledTimesOverlap(start?: Date, end?: Date): Prisma.Schedule_SlotListRelationFilter | undefined {
  if (!start && !end) return undefined;

  const AND: Prisma.Schedule_SlotWhereInput[] = [];
  if (end) AND.push({ initialDateScheduled: { lte: end } });
  if (start) AND.push({ endDate: { gte: start } });

  return { some: { AND } };
}

export const isUserOnEvent = (user: User, event: Event): boolean => {
  // Check if user is directly a required or optional member
  const isDirectMember =
    event.requiredMembers.some((member) => member.userId === user.userId) ||
    event.optionalMembers.some((member) => member.userId === user.userId);

  if (isDirectMember) {
    return true;
  }

  // Check if user is on any of the event's teams (as member, lead, or head)
  const isOnEventTeam = event.teams.some(
    (team) =>
      team.members.some((member) => member.userId === user.userId) ||
      team.leads.some((lead) => lead.userId === user.userId) ||
      team.head.userId === user.userId
  );

  if (isOnEventTeam) {
    return true;
  }

  // Check if user is on any team that belongs to the event's team type
  if (event.teamType) {
    const isOnTeamType = event.teamType.teams.some(
      (team) =>
        team.members.some((member) => member.userId === user.userId) ||
        team.leads.some((lead) => lead.userId === user.userId) ||
        team.head.userId === user.userId
    );

    if (isOnTeamType) {
      return true;
    }
  }

  if (event.userCreated.userId === user.userId) {
    return true;
  }

  return false;
};

/**
 * Validates that an event's data matches its event type configuration.
 * Throws an exception if required fields are missing or if fields are provided that the event type doesn't allow.
 *
 * @param eventType The event type to validate against
 * @param eventData The event data to validate
 * @throws InvalidEventTypeConfigurationException if validation fails
 */
export function validateEventTypeConfiguration(
  eventType: Event_Type,
  eventData: {
    requiredMemberIds: string[];
    optionalMemberIds: string[];
    teamIds: string[];
    shopIds: string[];
    machineryIds: string[];
    workPackageIds: string[];
    documents: EventDocumentCreateArgs[];
    scheduleSlot: ScheduleSlotCreateArgs[];
    teamTypeId?: string;
    location?: string;
    zoomLink?: string;
    questionDocumentLink?: string;
    description?: string;
  }
): void {
  const requiresLocationOrZoom = eventType.location || eventType.zoomLink;

  const missingBoth = !eventData.location && !eventData.zoomLink;

  // Check required fields
  if (eventType.requiredMembers && eventData.requiredMemberIds.length === 0) {
    throw new InvalidEventTypeConfigurationException('at least one required member');
  }
  if (eventType.teamType && !eventData.teamTypeId) {
    throw new InvalidEventTypeConfigurationException('a team type');
  }
  if (requiresLocationOrZoom && missingBoth) {
    throw new InvalidEventTypeConfigurationException('a location or zoom link');
  }
  if (eventType.workPackage && eventData.workPackageIds.length === 0) {
    throw new InvalidEventTypeConfigurationException('at least one work package');
  }
  if (eventType.questionDocument && !eventData.questionDocumentLink) {
    throw new InvalidEventTypeConfigurationException('a question document');
  }
  if (eventData.scheduleSlot.length === 0) {
    throw new InvalidEventTypeConfigurationException('at least one schedule slot');
  }

  // Check disallowed fields (inverse validation)
  if (!eventType.requiredMembers && eventData.requiredMemberIds.length > 0) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow required members');
  }
  if (!eventType.optionalMembers && eventData.optionalMemberIds.length > 0) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow optional members');
  }
  if (!eventType.location && eventData.location) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow a location');
  }
  if (!eventType.zoomLink && eventData.zoomLink) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow a zoom link');
  }
  if (!eventType.shop && eventData.shopIds.length > 0) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow shops');
  }
  if (!eventType.machinery && eventData.machineryIds.length > 0) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow machinery');
  }
  if (!eventType.workPackage && eventData.workPackageIds.length > 0) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow work packages');
  }
  if (!eventType.questionDocument && eventData.questionDocumentLink) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow a question document');
  }
  if (!eventType.documents && eventData.documents.length > 0) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow documents');
  }
  if (!eventType.description && eventData.description) {
    throw new InvalidEventTypeConfigurationException('Event type does not allow a description');
  }
}

/**
 * Checks if there are any scheduling conflicts with existing events.
 * A conflict occurs when events overlap in both time and location.
 *
 * @param eventId The event ID to exclude from conflict check (for edits)
 * @param scheduleSlots The schedule slots to check
 * @param location The location to check
 * @param organization The organization
 * @returns An object with hasConflict boolean and the user who should approve (if any)
 */
export async function checkEventConflicts(
  scheduleSlots: ScheduleSlotCreateArgs[],
  organization: Organization,
  location?: string,
  eventId?: string
): Promise<{ hasConflict: boolean; conflictingEvent?: Event }> {
  // No conflict if there's no location
  if (!location) {
    return { hasConflict: false };
  }

  // No conflict if there are no schedule slots
  if (scheduleSlots.length === 0) {
    return { hasConflict: false };
  }

  // Find all events in the same organization with the same location
  const potentialConflicts = await prisma.event.findMany({
    where: {
      eventId: eventId ? { not: eventId } : undefined, // Exclude current event if editing
      location,
      dateDeleted: null,
      approved: { in: [ConflictStatus.APPROVED, ConflictStatus.NO_CONFLICT] },
      eventType: {
        organizationId: organization.organizationId
      }
    },
    ...getEventQueryArgs(organization.organizationId)
  });

  // Check each schedule slot against existing events
  for (const newSlot of scheduleSlots) {
    for (const event of potentialConflicts) {
      for (const existingSlot of event.scheduledTimes) {
        // Check if there's a day overlap
        const dayOverlap = newSlot.days.some((day) => existingSlot.days.includes(day));

        if (!dayOverlap) continue;

        // Check if there's a date range overlap
        const newStartDate = new Date(newSlot.initialDateScheduled);
        const newEndDate = new Date(newStartDate.getTime() + (newSlot.recurrenceNumber ?? 0) * 7 * 24 * 60 * 60 * 1000);
        const existingStartDate = new Date(existingSlot.initialDateScheduled);
        const existingEndDate = new Date(existingSlot.endDate);

        const dateOverlap = newStartDate <= existingEndDate && newEndDate >= existingStartDate;

        if (!dateOverlap) continue;

        // If both are all-day events, they conflict
        if (newSlot.allDay && existingSlot.allDay) {
          return { hasConflict: true, conflictingEvent: eventTransformer(event) };
        }

        // If one is all-day and the other isn't, they conflict
        if (newSlot.allDay || existingSlot.allDay) {
          return { hasConflict: true, conflictingEvent: eventTransformer(event) };
        }

        // Check time overlap (both have specific times)
        if (newSlot.startTime && newSlot.endTime && existingSlot.startTime && existingSlot.endTime) {
          const newStart = new Date(newSlot.startTime).getTime();
          const newEnd = new Date(newSlot.endTime).getTime();
          const existingStart = new Date(existingSlot.startTime).getTime();
          const existingEnd = new Date(existingSlot.endTime).getTime();

          const timeOverlap = newStart < existingEnd && newEnd > existingStart;

          if (timeOverlap) {
            return {
              hasConflict: true,
              conflictingEvent: eventTransformer(event)
            };
          }
        }
      }
    }
  }

  return { hasConflict: false };
}

/**
 * This function removes any deleted documents and adds any new documents
 * @param documents the new list of documents to compare against the old ones
 * @param currentDocuments the current list of documents on the event that's being edited
 */
export const removeDeletedEventDocuments = async (
  newDocuments: EventDocumentCreateArgs[],
  currentDocuments: Document[],
  submitter: User
) => {
  if (currentDocuments.length === 0) return;
  const deletedDocuments = currentDocuments.filter(
    (currentDocument) => !newDocuments.find((document) => document.googleFileId === currentDocument.googleFileId)
  );

  //mark any deleted documents as deleted in the database
  await prisma.document.updateMany({
    where: { documentId: { in: deletedDocuments.map((document) => document.documentId) } },
    data: {
      dateDeleted: new Date(),
      deletedByUserId: submitter.userId
    }
  });
};
