import { calendarTransformer, machineryTransformer } from '../transformers/calendar.transformer';
import { getMachineryQueryArgs } from '../prisma-query-args/machinery.query-args';
import { Organization, User } from '@prisma/client';
import { isAdmin, isHead, EventType, Shop, Calendar } from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { eventTypeTransformer } from '../transformers/calendar.transformer';
import { getEventTypeQueryArgs } from '../prisma-query-args/event-type.query-args';
import { shopTransformer } from '../transformers/calendar.transformer';
import { getShopQueryArgs } from '../prisma-query-args/shop.query-args';
import { getCalendarQueryArgs } from '../prisma-query-args/calendar.query-args';

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

    // Update the machinery and its shop machinery relationship
    const updatedMachinery = await prisma.machinery.update({
      where: { machineryId },
      data: {
        name,
        shops: {
          deleteMany: {},
          create: {
            shopId,
            quantity,
            description
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
}
