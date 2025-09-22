import { machineryTransformer } from '../transformers/calendar.transformer';
import { getMachineryQueryArgs } from '../prisma-query-args/machinery.query-args';
import { Organization, User } from '@prisma/client';
import { isAdmin, EventType, Shop } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { eventTypeTransformer } from '../transformers/calendar.transformer';
import { getEventTypeQueryArgs } from '../prisma-query-args/event-type.query-args';
import { shopTransformer } from '../transformers/calendar.transformer';
import { getShopQueryArgs } from '../prisma-query-args/shop.query-args';

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
      throw new AccessDeniedAdminOnlyException('shop does not belong to the specified organization');
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
}
