import { calendarTransformer, eventTransformer, machineryTransformer } from '../transformers/calendar.transformer';
import { getMachineryQueryArgs } from '../prisma-query-args/machinery.query-args';
import { Organization } from '@prisma/client';
import {
  isAdmin,
  isHead,
  EventType,
  Shop,
  Calendar,
  User,
  ScheduleSlotCreateArgs,
  AvailabilityCreateArgs,
  Event,
  FilterArgs,
  Machinery
} from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  InvalidOrganizationException,
  NotFoundException,
  HttpException
} from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { eventTypeTransformer } from '../transformers/calendar.transformer';
import { getEventTypeQueryArgs } from '../prisma-query-args/event-type.query-args';
import { shopTransformer } from '../transformers/calendar.transformer';
import { getShopQueryArgs } from '../prisma-query-args/shop.query-args';
import { getCalendarQueryArgs } from '../prisma-query-args/calendar.query-args';
import { getEventQueryArgs } from '../prisma-query-args/event.query-args';
import { buildScheduledTimesOverlap } from '../utils/calendar.utils';

export default class CalendarService {
  /**
   * Creates a new event type.
   *
   * @param submitter The user submitting the request, who must be an admin.
   * @param name The name of the event type.
   * @param calendarIds An array of the calendars this event type is associated with.
   * @param organization The organization for which the event type is being created.
   * @param initialDateScheduled Determines if a date is associated with this event type.
   * @param recurring Determines if this event type is recurring.
   * @param allDay Determines if this event type is all day.
   * @param members Determines if this event type has members.
   * @param location Determines if this event type has a location.
   * @param zoomLink Determines if this event type has a zoom link.
   * @param availabilities Determines if this event type has availabilities.
   * @param shop Determines if a shop is associated with this event type.
   * @param machinery Determines if machinery is associated with this event type.
   * @param workPackage Determines if a work package is associated with this event type.
   * @param questionDocument Determines if a question document is associated with this event type.
   * @param documents Determines if documents are associates with this event type.
   * @param description Determines if a description is associated with this event type.
   *
   * @returns The created event type.
   *
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   * @throws NotFoundException If the given calendarIds are not found.
   * @throws InvalidOrganizationException If the given calendarIds are not part of the same organization.
   */
  static async createEventType(
    submitter: User,
    name: string,
    calendarIds: string[],
    organization: Organization,
    initialDateScheduled: boolean,
    recurring: boolean,
    allDay: boolean,
    members: boolean,
    location: boolean,
    zoomLink: boolean,
    availabilities: boolean,
    shop: boolean,
    machinery: boolean,
    workPackage: boolean,
    questionDocument: boolean,
    documents: boolean,
    description: boolean
  ): Promise<EventType> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create event type');
    }

    // Check if calendars with ids exist and belong to the same organization
    const existingCalendars = await prisma.calendar.findMany({
      where: {
        calendarId: { in: calendarIds }
      }
    });

    // Ensure all provided calendars exist
    if (existingCalendars.length !== calendarIds.length) {
      const foundIds = existingCalendars.map((c) => c.calendarId);
      const missingIds = calendarIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException('Calendar', missingIds.join(', '));
    }

    // Ensure all calendars belong to the given organization
    for (const calendar of existingCalendars) {
      if (calendar.organizationId !== organization.organizationId) {
        throw new InvalidOrganizationException('Calendar');
      }
    }

    const duplicate = await prisma.eventType.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' }
      }
    });
    if (duplicate) {
      throw new HttpException(409, "Can't have two event types with the same name");
    }

    const newEventType = await prisma.eventType.create({
      data: {
        name,
        calendars: {
          connect: calendarIds.map((calendarId) => ({ calendarId }))
        },
        userCreatedId: submitter.userId,
        initialDateScheduled,
        recurring,
        allDay,
        members,
        location,
        zoomLink,
        availabilities,
        shop,
        machinery,
        workPackage,
        questionDocument,
        documents,
        description,
        organizationId: organization.organizationId
      },
      ...getEventTypeQueryArgs(organization.organizationId)
    });

    return eventTypeTransformer(newEventType);
  }

  /**
   * Creates a new machinery and associates it with shops.
   *
   * @param submitter The user submitting the request, who must be an admin.
   * @param name The name of the machinery.
   * @param shopMachineryData Array of shop machinery data containing shopId, quantity, and optional description.
   * @param organization The organization for which the machinery is being created.
   * @param description The description of the machinery (optional).
   *
   * @returns The created machinery object with associated shop machinery.
   *
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   * @throws NotFoundException If the shop with the given shopId does not exist.
   */
  static async createMachinery(
    submitter: User,
    name: string,
    shopId: string,
    quantity: number,
    organization: Organization,
    description?: string
  ) {
    // Check if user is admin
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create machinery');
    }

    // Check if shop with id exists and belongs to the same organization
    const existingShop = await prisma.shop.findUnique({
      where: { shopId }
    });

    if (!existingShop) {
      throw new NotFoundException('Shop', shopId);
    }

    if (existingShop.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Shop');
    }

    const duplicate = await prisma.machinery.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' }
      }
    });
    if (duplicate) {
      throw new HttpException(409, "Can't have two machinery with the same name");
    }
    const newMachinery = await prisma.machinery.create({
      data: {
        name,
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId,
        shops: {
          create: [
            {
              shopId,
              quantity,
              description
            }
          ]
        }
      },
      ...getMachineryQueryArgs(organization.organizationId)
    });

    return machineryTransformer(newMachinery);
  }

  /**
   * Creates a new event.
   *
   * @param submitter The user submitting the request, who must be an admin.
   * @param title The title of the event.
   * @param eventTypeId The event type id the event is associated with.
   * @param organization The organization for which the event type is being created.
   * @param memberIds An array of member ids that are invited to the event.
   * @param shopIds An array of shops associated with the event.
   * @param machineryIds An array of machinery associated with the event.
   * @param workPackageIds An array of work packages associated with the event.
   * @param documentIds An array of documents associated with the event.
   * @param scheduleSlots An array of schedule slots associated with the event.
   * @param availabilities An array of availabilities associated with the event.
   * @param approved Determines if the event has been approved.
   * @param approvedByUserId The ID of the approving user.
   * @param questionDocument The link to the question document.
   * @param location Location of the event.
   * @param zoomLink Zoom Link if the event is online.
   * @param description Describes the event.
   *
   * @returns The created event.
   *
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   * @throws NotFoundException If the given event type, member IDs, shop IDs, machinery IDs, work package IDs, document IDs, or approvedByUserId are not found.
   * @throws InvalidOrganizationException If the given event type, members, shops, machinery, work packages, or approvedByUserId are not part of the same organization.
   */
  static async createEvent(
    submitter: User,
    title: string,
    eventTypeId: string,
    organization: Organization,
    memberIds: string[],
    teamIds: string[],
    shopIds: string[],
    machineryIds: string[],
    workPackageIds: string[],
    documentIds: string[],
    scheduleSlot: ScheduleSlotCreateArgs[],
    availability: AvailabilityCreateArgs[],
    approved: boolean,
    approvedByUserId?: string,
    questionDocument?: string,
    location?: string,
    zoomLink?: string,
    description?: string
  ): Promise<Event> {
    // Validate eventTypeId
    const foundEventType = await prisma.eventType.findUnique({
      where: { eventTypeId }
    });
    if (!foundEventType) throw new NotFoundException('Event Type', eventTypeId);
    if (foundEventType.dateDeleted) throw new DeletedException('Event Type', eventTypeId);
    if (foundEventType.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Event Type');
    }

    // Validate memberIds
    if (memberIds.length > 0) {
      const foundMembers = await prisma.user.findMany({
        where: {
          userId: { in: memberIds },
          organizations: { some: { organizationId: organization.organizationId } }
        }
      });
      if (foundMembers.length !== memberIds.length) {
        const missingIds = memberIds.filter((id) => !foundMembers.some((user) => user.userId === id));
        throw new NotFoundException('User', missingIds.join(', '));
      }
    }

    // Validate teamIds
    if (teamIds.length > 0) {
      const foundteams = await prisma.team.findMany({
        where: {
          teamId: { in: teamIds },
          organization: { organizationId: organization.organizationId }
        }
      });
      if (foundteams.length !== teamIds.length) {
        const missingIds = teamIds.filter((id) => !foundteams.some((team) => team.teamId === id));
        throw new NotFoundException('Team', missingIds.join(', '));
      }
    }

    // Validate shopIds
    if (shopIds.length > 0) {
      const foundShops = await prisma.shop.findMany({
        where: {
          shopId: { in: shopIds },
          organizationId: organization.organizationId,
          dateDeleted: null
        }
      });
      if (foundShops.length !== shopIds.length) {
        const missingIds = shopIds.filter((id) => !foundShops.some((shop) => shop.shopId === id));
        throw new NotFoundException('Shop', missingIds.join(', '));
      }
    }

    // Validate machineryIds
    if (machineryIds.length > 0) {
      const foundMachinery = await prisma.machinery.findMany({
        where: {
          machineryId: { in: machineryIds },
          organizationId: organization.organizationId,
          dateDeleted: null
        }
      });
      if (foundMachinery.length !== machineryIds.length) {
        const missingIds = machineryIds.filter((id) => !foundMachinery.some((m) => m.machineryId === id));
        throw new NotFoundException('Machinery', missingIds.join(', '));
      }
    }

    // Validate workPackageIds
    if (workPackageIds.length > 0) {
      const foundWorkPackages = await prisma.work_Package.findMany({
        where: {
          workPackageId: { in: workPackageIds }
        }
      });
      if (foundWorkPackages.length !== workPackageIds.length) {
        const missingIds = workPackageIds.filter((id) => !foundWorkPackages.some((wp) => wp.workPackageId === id));
        throw new NotFoundException('Work Package', missingIds.join(', '));
      }
    }

    // Validate approvedByUserId
    if (approvedByUserId) {
      const foundApprovedByUser = await prisma.user.findUnique({
        where: {
          userId: approvedByUserId,
          organizations: { some: { organizationId: organization.organizationId } }
        }
      });
      if (!foundApprovedByUser) {
        throw new NotFoundException('User', approvedByUserId);
      }
    }

    // Ensure each availability has a scheduleSettingsId
    const availabilitiesWithScheduleSettings = await Promise.all(
      availability.map(async (availability) => {
        let scheduleSettings = await prisma.schedule_Settings.findUnique({
          where: { userId: submitter.userId }
        });

        if (!scheduleSettings) {
          scheduleSettings = await prisma.schedule_Settings.create({
            data: {
              userId: submitter.userId,
              personalGmail: '',
              personalZoomLink: ''
            }
          });
        }

        return {
          availability: availability.availability,
          dateSet: availability.dateSet,
          scheduleSettingsId: scheduleSettings.drScheduleSettingsId
        };
      })
    );

    const computeEndDate = (initial: Date, recurrenceNumber: number) => {
      const weeks = Math.max(1, recurrenceNumber ?? 0);
      return new Date(initial.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    };

    const duplicate = await prisma.event.findFirst({
      where: {
        dateDeleted: null,
        title: { equals: title, mode: 'insensitive' },
        // scope to org via related eventType
        eventType: { organizationId: organization.organizationId }
      }
    });
    if (duplicate) {
      throw new HttpException(409, "Can't have two events with the same title");
    }

    const newEvent = await prisma.event.create({
      data: {
        userCreatedId: submitter.userId,
        dateCreated: new Date(),
        title,
        eventTypeId,
        members: {
          connect: memberIds.map((userId) => ({ userId }))
        },
        teams: {
          connect: teamIds.map((teamId) => ({ teamId }))
        },
        shops: {
          connect: shopIds.map((shopId) => ({ shopId }))
        },
        machinery: {
          connect: machineryIds.map((machineryId) => ({ machineryId }))
        },
        workPackages: {
          connect: workPackageIds.map((workPackageId) => ({ workPackageId }))
        },
        documentIds,
        scheduledTimes: {
          create: scheduleSlot.map((s) => ({
            days: s.days,
            startTime: s.startTime ?? null,
            endTime: s.endTime ?? null,
            recurrenceNumber: s.recurrenceNumber,
            initialDateScheduled: s.initialDateScheduled,
            endDate: computeEndDate(s.initialDateScheduled, s.recurrenceNumber),
            allDay: s.allDay
          }))
        },
        availabilities: {
          createMany: {
            data: availabilitiesWithScheduleSettings
          }
        },
        approved,
        approvedByUserId,
        location,
        zoomLink,
        questionDocument,
        description
      },
      ...getEventQueryArgs(organization.organizationId)
    });

    return eventTransformer(newEvent);
  }

  /**
   * Edits an existing machinery and its associated shop machinery.
   *
   * @param submitter The user submitting the request, who must be a head or above.
   * @param machineryId The ID of the machinery to edit.
   * @param name The new name of the machinery.
   * @param shopId The shop ID to associate with the machinery.
   * @param quantity The quantity of machinery in the shop.
   * @param organization The organization for which the machinery is being edited.
   * @param description The description of the machinery (optional).
   *
   * @returns The updated machinery object with associated shop machinery.
   *
   * @throws AccessDeniedException If the submitter is not a head or above.
   * @throws NotFoundException If the machinery or shop with the given IDs do not exist.
   * @throws InvalidOrganizationException If the machinery or shop does not belong to the same organization.
   */
  static async editMachinery(
    submitter: User,
    machineryId: string,
    name: string,
    shopId: string,
    quantity: number,
    organization: Organization,
    description?: string
  ) {
    // Check if user is head or above
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads and above can edit machinery');
    }

    // Check if machinery with id exists and belongs to the same organization
    const existingMachinery = await prisma.machinery.findUnique({
      where: { machineryId }
    });

    if (!existingMachinery) {
      throw new NotFoundException('Machinery', machineryId);
    }

    if (existingMachinery.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Shop');
    }

    // Check if shop with id exists and belongs to the same organization
    const existingShop = await prisma.shop.findUnique({
      where: { shopId }
    });

    if (!existingShop) {
      throw new NotFoundException('Shop', shopId);
    }

    if (existingShop.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Shop');
    }

    const duplicate = await prisma.machinery.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' },
        // exclude the current machinery
        NOT: { machineryId }
      }
    });
    if (duplicate) {
      throw new HttpException(409, "Can't have two machinery with the same name");
    }

    // Update the machinery and its shop machinery relationship
    const updatedMachinery = await prisma.machinery.update({
      where: { machineryId },
      data: {
        name,
        shops: {
          updateMany: {
            where: { shopId },
            data: {
              quantity,
              description
            }
          }
        }
      },
      ...getMachineryQueryArgs(organization.organizationId)
    });

    return machineryTransformer(updatedMachinery);
  }

  /**
   * Creates a new shop
   * requires the submitter to be Admin
   */
  static async createShop(submitter: User, name: string, description: string, organization: Organization): Promise<Shop> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create shop');
    }

    const existing = await prisma.shop.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (existing) {
      throw new HttpException(409, "Can't have two shops with the same name");
    }

    const newShop = await prisma.shop.create({
      data: {
        name,
        description,
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId
      },
      ...getShopQueryArgs(organization.organizationId)
    });

    return shopTransformer(newShop);
  }

  /**
   * Edits an existing shop
   * @param submitter The user submitting the request, who must be a admin.
   * @param shopId The id of the shop to edit
   * @param name The name of the shop
   * @param description The description of the shop
   * @param organization The organization for which the shop is being edited
   * @returns Updated shop
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   * @throws NotFoundException If the shop with the given ID does not exist.
   * @throws DeletedException If the shop has already been deleted.
   * @throws InvalidOrganizationException If the shop does not belong to the given organization.
   */
  static async editShop(
    submitter: User,
    shopId: string,
    name: string,
    description: string,
    organization: Organization
  ): Promise<Shop> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create shop');
    }

    const existing = await prisma.shop.findUnique({ where: { shopId } });
    if (!existing) throw new NotFoundException('Shop', shopId);
    if (existing.dateDeleted) throw new DeletedException('Shop', shopId);
    if (existing.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Shop');

    const duplicate = await prisma.shop.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' },
        NOT: { shopId }
      }
    });

    if (duplicate) {
      throw new HttpException(409, "Can't have two shops with the same name");
    }

    const updatedShop = await prisma.shop.update({
      where: { shopId },
      data: { name, description },
      ...getShopQueryArgs(organization.organizationId)
    });

    return shopTransformer(updatedShop);
  }

  /**
   * @param submitter The user submitting the request, who must be an admin
   * @param name The name of the calendar
   * @param description A summary of what the calendar is used for
   * @param colorHexCode The color of the calendar
   * @param organization The organization for which the calendar is being created
   *
   * @returns The created calendar
   *
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   */
  static async createCalendar(
    submitter: User,
    name: string,
    description: string,
    colorHexCode: string,
    organization: Organization
  ): Promise<Calendar> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create calendar');
    }

    const duplicate = await prisma.calendar.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' }
      }
    });
    if (duplicate) {
      throw new HttpException(409, "Can't have two calendars with the same name");
    }

    const newCalendar = await prisma.calendar.create({
      data: {
        name,
        description,
        colorHexCode,
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId
      },
      ...getCalendarQueryArgs(organization.organizationId)
    });

    return calendarTransformer(newCalendar);
  }

  /**
   * @param submitter The user submitting the request, who must be an admin.
   * @param calendarId The id of the given calendar.
   * @param name The name of the calendar.
   * @param description The summary of what the calendar is used for.
   * @param colorHexCode The color of the calendar.
   * @param organization The organization for which the calendar is being edited.
   *
   * @returns The edited calendar.
   *
   * @throws NotFoundException If the given calendarId is not found.
   * @throws InvalidOrganizationException If the given calendarId is not part of the same organization.
   * @throws DeletedException If the calendar has already been deleted.
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   */
  static async editCalendar(
    submitter: User,
    calendarId: string,
    name: string,
    description: string,
    colorHexCode: string,
    organization: Organization
  ): Promise<Calendar> {
    const calendar = await prisma.calendar.findUnique({
      where: { calendarId }
    });

    if (!calendar) throw new NotFoundException('Calendar', calendarId);
    if (calendar.dateDeleted) throw new DeletedException('Calendar', calendarId);
    if (calendar.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Calendar');

    const hasPermission = await userHasPermission(submitter.userId, organization.organizationId, isAdmin);

    if (!hasPermission) {
      throw new AccessDeniedException('Only admins can edit calendars');
    }

    const duplicate = await prisma.calendar.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' },
        NOT: { calendarId }
      }
    });

    if (duplicate) {
      throw new HttpException(409, "Can't have two calendars with the same name");
    }

    const newCalendar = await prisma.calendar.update({
      where: { calendarId },
      data: {
        name,
        description,
        colorHexCode
      },
      ...getCalendarQueryArgs(organization.organizationId)
    });

    return calendarTransformer(newCalendar);
  }

  /**
   * Delete calendar in the database
   * @param submitter The user submitting the request, who must be an admin.
   * @param calendarId The id of the given calendar.
   * @param organization The organization for which the calendar is being deleted.
   *
   * @returns The deleted calendar.
   *
   * @throws NotFoundException If the given calendarId is not found.
   * @throws InvalidOrganizationException If the given calendarId is not part of the same organization.
   * @throws DeletedException If the calendar has already been deleted.
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   */
  static async deleteCalendar(submitter: User, calendarId: string, organization: Organization): Promise<Calendar> {
    const calendar = await prisma.calendar.findUnique({
      where: { calendarId }
    });

    if (!calendar) throw new NotFoundException('Calendar', calendarId);
    if (calendar.dateDeleted) throw new DeletedException('Calendar', calendarId);
    if (calendar.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Calendar');

    const hasPermission = await userHasPermission(submitter.userId, organization.organizationId, isAdmin);

    if (!hasPermission) {
      throw new AccessDeniedException('Only admins can delete calendars');
    }

    const deletedCalendar = await prisma.calendar.update({
      where: { calendarId },
      data: { dateDeleted: new Date(), userDeletedId: submitter.userId },
      ...getCalendarQueryArgs(organization.organizationId)
    });

    return calendarTransformer(deletedCalendar);
  }

  /**
   * Edits a given event type.
   *
   * @param eventTypeId The id of the event type of be edited
   * @param submitter The user submitting the request, who must be an admin.
   * @param name The name of the event type.
   * @param calendarIds An array of the calendars this event type is associated with.
   * @param organization The organization for which the event type is being created.
   * @param initialDateScheduled Determines if a date is associated with this event type.
   * @param recurring Determines if this event type is recurring.
   * @param allDay Determines if this event type is all day.
   * @param members Determines if this event type has members.
   * @param location Determines if this event type has a location.
   * @param zoomLink Determines if this event type has a zoom link.
   * @param availabilities Determines if this event type has availabilities.
   * @param shop Determines if a shop is associated with this event type.
   * @param machinery Determines if machinery is associated with this event type.
   * @param workPackage Determines if a work package is associated with this event type.
   * @param questionDocument Determines if a question document is associated with this event type.
   * @param documents Determines if documents are associates with this event type.
   * @param description Determines if a description is associated with this event type.
   *
   * @returns The created event type.
   *
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   * @throws NotFoundException If the given calendarIds are not found.
   * @throws InvalidOrganizationException If the given calendarIds are not part of the same organization.
   */
  static async editEventType(
    eventTypeId: string,
    submitter: User,
    calendarIds: string[],
    organization: Organization,
    initialDateScheduled: boolean,
    recurring: boolean,
    allDay: boolean,
    members: boolean,
    location: boolean,
    zoomLink: boolean,
    availabilities: boolean,
    shop: boolean,
    machinery: boolean,
    workPackage: boolean,
    questionDocument: boolean,
    documents: boolean,
    description: boolean
  ): Promise<EventType> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('edit event type');
    }

    // Check if calendars with ids exist and belong to the same organization
    const existingCalendars = await prisma.calendar.findMany({
      where: {
        calendarId: { in: calendarIds }
      }
    });

    // Ensure all provided calendars exist
    if (existingCalendars.length !== calendarIds.length) {
      const foundIds = existingCalendars.map((c) => c.calendarId);
      const missingIds = calendarIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException('Calendar', missingIds.join(', '));
    }

    // Ensure all calendars belong to the given organization
    for (const calendar of existingCalendars) {
      if (calendar.organizationId !== organization.organizationId) {
        throw new InvalidOrganizationException('Calendar');
      }
    }

    // Ensure event type to edit exists
    const oldEventType = await prisma.eventType.findUnique({
      where: {
        eventTypeId,
        organizationId: organization.organizationId
      }
    });

    if (!oldEventType) throw new NotFoundException('Event Type', eventTypeId);
    if (oldEventType.dateDeleted) throw new DeletedException('Event Type', eventTypeId);

    const updatedEventType = await prisma.eventType.update({
      where: { eventTypeId: oldEventType.eventTypeId },
      data: {
        calendars: {
          connect: calendarIds.map((calendarId) => ({ calendarId }))
        },
        initialDateScheduled,
        recurring,
        allDay,
        members,
        location,
        zoomLink,
        availabilities,
        shop,
        machinery,
        workPackage,
        questionDocument,
        documents,
        description
      },
      ...getEventTypeQueryArgs(organization.organizationId)
    });

    return eventTypeTransformer(updatedEventType);
  }

  /**
   * Deletes a shop by its ID.
   * Requires the submitter to be head or above.
   * @param submitter The user submitting the request.
   * @param shopId The ID of the shop to be deleted.
   * @param organization The organization to which the shop belongs.
   * @returns The deleted shop object.
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   * @throws NotFoundException If the shop with the given ID does not exist.
   * @throws InvalidOrganizationException If the shop does not belong to the given organization.
   *
   */

  static async deleteShop(submitter: User, shopId: string, organization: Organization): Promise<Shop> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete shop');
    }

    // Ensure the shop exists
    const existing = await prisma.shop.findUnique({ where: { shopId } });
    if (!existing) throw new NotFoundException('Shop', shopId);

    // Ensure it belongs to this org
    if (existing.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Shop');
    }

    // not already soft-deleted
    if (existing.dateDeleted) {
      throw new NotFoundException('Shop', shopId);
    }

    // Soft delete the shop and its associated shop machinery in a transaction
    const deleted = await prisma.$transaction(async (tx) => {
      await tx.shopMachinery.deleteMany({ where: { shopId } });

      return tx.shop.update({
        where: { shopId },
        data: { dateDeleted: new Date() },
        include: getShopQueryArgs(organization.organizationId).include
      });
    });

    return shopTransformer(deleted);
  }

  /**
   * Gets all events that match the given filter arguments
   *
   * @param filters Filters for the events you want to get, which include member IDs, team IDs, event IDs, event type IDs, approval status, and date ranges
   *
   * @returns The all events that match all of the given filter arguments.
   *
   * @throws NotFoundException If the given event type Ids, member IDs, team IDs, or event IDs are not found.
   */
  static async getFilteredEvents(filters: FilterArgs, organization: Organization): Promise<Event[]> {
    const { memberIds, teamIds, calendarIds, eventTypeIds, eventIds, approvalStatus, startPeriod, endPeriod } = filters;

    // validate memberIds
    if (memberIds?.length) {
      const foundMembers = await prisma.user.findMany({
        where: {
          userId: { in: memberIds },
          organizations: { some: { organizationId: organization.organizationId } }
        }
      });
      if (foundMembers.length !== memberIds.length) {
        const missingIds = memberIds.filter((id) => !foundMembers.some((mem) => mem.userId === id));
        throw new NotFoundException('User', missingIds.join(', '));
      }
    }

    // validate teamIds
    if (teamIds?.length) {
      const foundteams = await prisma.team.findMany({
        where: {
          teamId: { in: teamIds },
          organization: { organizationId: organization.organizationId }
        }
      });
      if (foundteams.length !== teamIds.length) {
        const missingIds = teamIds.filter((id) => !foundteams.some((team) => team.teamId === id));
        throw new NotFoundException('Team', missingIds.join(', '));
      }
    }

    // validate calendarIds
    if (calendarIds?.length) {
      const foundcalendars = await prisma.calendar.findMany({
        where: {
          calendarId: { in: calendarIds },
          organization: { organizationId: organization.organizationId },
          dateDeleted: null
        }
      });
      if (foundcalendars.length !== calendarIds.length) {
        const missingIds = calendarIds.filter((id) => !foundcalendars.some((mem) => mem.calendarId === id));
        throw new NotFoundException('Calendar', missingIds.join(', '));
      }
    }

    // validate eventTypeIds
    if (eventTypeIds?.length) {
      const foundEventTypes = await prisma.eventType.findMany({
        where: {
          eventTypeId: { in: eventTypeIds },
          organization: { organizationId: organization.organizationId },
          dateDeleted: null
        }
      });
      if (foundEventTypes.length !== eventTypeIds.length) {
        const missingIds = eventTypeIds.filter((id) => !foundEventTypes.some((et) => et.eventTypeId === id));
        throw new NotFoundException('Event Type', missingIds.join(', '));
      }
    }

    // validate eventIds
    if (eventIds?.length) {
      const foundEvents = await prisma.event.findMany({
        where: {
          eventId: { in: eventIds },
          dateDeleted: null
        }
      });
      if (foundEvents.length !== eventIds.length) {
        const missingIds = eventIds.filter((id) => !foundEvents.some((et) => et.eventId === id));
        throw new NotFoundException('Event', missingIds.join(', '));
      }
    }

    // filters for members
    const memberOrCreator = memberIds?.length
      ? {
          OR: [
            { members: { some: { userId: { in: memberIds } } } }, // attendee
            { userCreatedId: { in: memberIds } } // creator
          ]
        }
      : undefined;

    // filters for selected calendars
    const fromCalendar = calendarIds?.length
      ? {
          eventType: {
            is: {
              organizationId: organization.organizationId,
              calendars: {
                some: {
                  calendarId: { in: calendarIds },
                  organizationId: organization.organizationId
                }
              }
            }
          }
        }
      : undefined;

    // get event using filter args
    const events = await prisma.event.findMany({
      where: {
        dateDeleted: null,
        eventId: eventIds?.length ? { in: eventIds } : undefined,
        eventTypeId: eventTypeIds?.length ? { in: eventTypeIds } : undefined,
        teams: teamIds?.length ? { some: { teamId: { in: teamIds } } } : undefined,
        approved: approvalStatus !== undefined ? { equals: approvalStatus } : undefined,
        scheduledTimes: buildScheduledTimesOverlap(startPeriod, endPeriod),
        ...memberOrCreator,
        ...fromCalendar
      },
      ...getEventQueryArgs(organization.organizationId),
      orderBy: { dateCreated: 'asc' }
    });

    return events.map(eventTransformer);
  }

  static async getAllShops(organization: Organization): Promise<Shop[]> {
    const shops = await prisma.shop.findMany({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null
      },
      ...getShopQueryArgs(organization.organizationId)
    });

    return shops.map(shopTransformer);
  }

  static async getAllCalendars(organization: Organization): Promise<Calendar[]> {
    const calendars = await prisma.calendar.findMany({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null
      },
      ...getCalendarQueryArgs(organization.organizationId)
    });

    return calendars.map(calendarTransformer);
  }
  /**
   * Deletes a machinery by its ID.
   * Requires the submitter to be an admin.
   * @param submitter The user submitting the request.
   * @param machineryid The ID of the machinery to be deleted.
   * @param organization The organization to which the machinery belongs.
   * @returns The deleted machinery object.
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   * @throws NotFoundException If the machinery with the given ID does not exist.
   * @throws InvalidOrganizationException If the machinery does not belong to the given organization.
   *
   */

  static async deleteMachinery(submitter: User, machineryId: string, organization: Organization): Promise<Machinery> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete machinery');
    }

    // Ensure the machinery exists
    const existing = await prisma.machinery.findUnique({ where: { machineryId } });
    if (!existing) throw new NotFoundException('Machinery', machineryId);

    // Ensure it belongs to this org
    if (existing.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Machinery');
    }

    // not already soft-deleted
    if (existing.dateDeleted) {
      throw new NotFoundException('Machinery', machineryId);
    }

    // Soft delete machinery and remove shop mappings in a transaction
    const deleted = await prisma.$transaction(async (tx) => {
      await tx.shopMachinery.deleteMany({
        where: { machineryId }
      });

      return await tx.machinery.update({
        where: { machineryId },
        data: {
          dateDeleted: new Date(),
          userDeletedId: submitter.userId
        },
        ...getMachineryQueryArgs(organization.organizationId)
      });
    });

    return machineryTransformer(deleted);
  }
}
