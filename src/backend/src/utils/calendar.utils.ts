import { Prisma, Event_Type, Organization } from '@prisma/client';
import {
  User,
  ScheduleSlotCreateArgs,
  EventDocumentCreateArgs,
  Document,
  ConflictStatus,
  Event,
  EventWithMembers
} from 'shared';
import { InvalidEventTypeConfigurationException } from './errors.utils.js';
import prisma from '../prisma/prisma.js';
import { getEventQueryArgs } from '../prisma-query-args/event.query-args.js';
import { eventTransformer } from '../transformers/calendar.transformer.js';

export function buildScheduledTimesOverlap(start?: Date, end?: Date): Prisma.Schedule_SlotListRelationFilter | undefined {
  if (!start && !end) return undefined;

  // With the new schema, we check if the slot's time range overlaps with the query range
  const AND: Prisma.Schedule_SlotWhereInput[] = [];

  // For all-day events, we just check the date portion
  // For timed events, we check the full datetime
  if (start) {
    AND.push({
      OR: [
        { allDay: true, startTime: { gte: start } },
        { allDay: false, endTime: { gte: start } }
      ]
    });
  }

  if (end) {
    AND.push({
      OR: [
        { allDay: true, startTime: { lte: end } },
        { allDay: false, startTime: { lte: end } }
      ]
    });
  }

  return { some: { AND } };
}

export const isUserOnEvent = (user: User, event: EventWithMembers): boolean => {
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
    scheduleSlots: ScheduleSlotCreateArgs[];
    initialDateScheduled?: Date;
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

  // For requiresConfirmation events, the event must have an initialDateScheduled
  if (eventType.requiresConfirmation && !eventData.initialDateScheduled) {
    throw new InvalidEventTypeConfigurationException('an initial date scheduled');
  }

  // For non-requiresConfirmation events, there must be at least one schedule slot
  if (!eventType.requiresConfirmation && eventData.scheduleSlots.length === 0) {
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
 * @param scheduleSlots The schedule slots to check (individual occurrences with full datetimes)
 * @param location The location to check
 * @param organization The organization
 * @param eventId The event ID to exclude from conflict check (for edits)
 * @returns An object with hasConflict boolean and the conflicting event (if any)
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

  // To limit speed issues, find min start and max end across time slots being checked, and limit potential conflicts to that range
  let minStart: Date | null = null;
  let maxEnd: Date | null = null;

  for (const slot of scheduleSlots) {
    if (slot.startTime) {
      if (!minStart || slot.startTime < minStart) {
        minStart = slot.startTime;
      }
    }
    if (slot.endTime) {
      if (!maxEnd || slot.endTime > maxEnd) {
        maxEnd = slot.endTime;
      }
    }
  }

  // Find all events in the same organization with the same location
  const potentialConflicts = await prisma.event.findMany({
    where: {
      eventId: eventId ? { not: eventId } : undefined,
      location,
      dateDeleted: null,
      approved: { in: [ConflictStatus.APPROVED, ConflictStatus.NO_CONFLICT] },
      eventType: {
        organizationId: organization.organizationId
      },
      scheduledTimes: buildScheduledTimesOverlap(minStart ?? undefined, maxEnd ?? undefined)
    },
    ...getEventQueryArgs(organization.organizationId)
  });

  // Check each new schedule slot against existing event slots
  for (const newSlot of scheduleSlots) {
    for (const event of potentialConflicts) {
      for (const existingSlot of event.scheduledTimes) {
        if (!existingSlot.startTime || !existingSlot.endTime) continue;

        // Check if events overlap
        // If both are all-day events on the same day, they conflict
        if (newSlot.allDay && existingSlot.allDay) {
          const newDate = new Date(newSlot.startTime);
          const existingDate = new Date(existingSlot.startTime);

          // Normalize to compare dates only
          newDate.setHours(0, 0, 0, 0);
          existingDate.setHours(0, 0, 0, 0);

          if (newDate.getTime() === existingDate.getTime()) {
            return { hasConflict: true, conflictingEvent: eventTransformer(event) };
          }
        }
        // If one is all-day, check if the all-day event's date overlaps with the timed event
        else if (newSlot.allDay || existingSlot.allDay) {
          const allDaySlot = newSlot.allDay ? newSlot : existingSlot;
          const timedSlot = newSlot.allDay ? existingSlot : newSlot;

          const allDayDate = new Date(allDaySlot.startTime!);
          allDayDate.setHours(0, 0, 0, 0);

          const timedStart = new Date(timedSlot.startTime!);
          const timedDate = new Date(timedStart);
          timedDate.setHours(0, 0, 0, 0);

          if (allDayDate.getTime() === timedDate.getTime()) {
            return { hasConflict: true, conflictingEvent: eventTransformer(event) };
          }
        }
        // Both have specific times - check for time overlap
        else {
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

/**
 * Finds all schedule slots that have the same time-of-day pattern as the original slot.
 * This is used for "edit all in series" functionality where we want to update all slots
 * that were created with the same recurring time pattern.
 *
 * @param allSlots All schedule slots for an event
 * @param originalSlotId The ID of the slot being edited
 * @returns Array of schedule slots that match the original slot's time-of-day pattern
 */
export const findMatchingTimeOfDaySlots = <T extends { scheduleSlotId: string; startTime: Date; endTime: Date }>(
  allSlots: T[],
  originalSlotId: string
): T[] => {
  const originalSlot = allSlots.find((s) => s.scheduleSlotId === originalSlotId);

  if (!originalSlot || !originalSlot.startTime || !originalSlot.endTime) {
    // If we can't find the original slot or it has no times, return just that slot
    const slot = allSlots.find((s) => s.scheduleSlotId === originalSlotId);
    return slot ? [slot] : [];
  }

  const originalStartHour = originalSlot.startTime.getHours();
  const originalStartMinute = originalSlot.startTime.getMinutes();
  const originalEndHour = originalSlot.endTime.getHours();
  const originalEndMinute = originalSlot.endTime.getMinutes();

  // Find all slots that have the same time-of-day
  return allSlots.filter((slot) => {
    if (!slot.startTime || !slot.endTime) return false;
    return (
      slot.startTime.getHours() === originalStartHour &&
      slot.startTime.getMinutes() === originalStartMinute &&
      slot.endTime.getHours() === originalEndHour &&
      slot.endTime.getMinutes() === originalEndMinute
    );
  });
};
