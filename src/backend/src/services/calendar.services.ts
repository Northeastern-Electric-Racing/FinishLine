import { calendarTransformer, eventTransformer, machineryTransformer } from '../transformers/calendar.transformer';
import { getMachineryQueryArgs } from '../prisma-query-args/machinery.query-args';
import { Event_Status, Organization } from '@prisma/client';
import {
  isAdmin,
  isHead,
  EventType,
  Shop,
  Calendar,
  User,
  ScheduleSlotCreateArgs,
  Event,
  FilterArgs,
  Machinery,
  AvailabilityCreateArgs,
  EventStatus,
  EventDocumentCreateArgs,
  isGuest
} from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  AccessDeniedGuestException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import {
  areUsersinList,
  getPrismaQueryUserIds,
  getUsers,
  updateUserAvailability,
  userHasPermission
} from '../utils/users.utils';
import { eventTypeTransformer } from '../transformers/calendar.transformer';
import { getEventTypeQueryArgs } from '../prisma-query-args/event-type.query-args';
import { shopTransformer } from '../transformers/calendar.transformer';
import { getShopQueryArgs } from '../prisma-query-args/shop.query-args';
import { getCalendarQueryArgs } from '../prisma-query-args/calendar.query-args';
import { getEventQueryArgs } from '../prisma-query-args/event.query-args';
import {
  buildScheduledTimesOverlap,
  checkEventConflicts,
  isUserOnEvent,
  removeDeletedEventDocuments,
  validateEventTypeConfiguration
} from '../utils/calendar.utils';
import { UserWithSettings } from '../utils/auth.utils';
import { getUserScheduleSettingsQueryArgs } from '../prisma-query-args/user.query-args';
import {
  sendEventConfirmationToThread,
  sendEventScheduledSlackNotif,
  sendEventUserConfirmationToThread,
  sendSlackEventNotifications,
  sendSlackEventConfirmNotification
} from '../utils/slack.utils';
import { sendEventPopUp } from '../utils/pop-up.utils';
import { downloadFile, uploadFile } from '../utils/google-integration.utils';

export default class CalendarService {
  /**
   * Creates a new event type.
   *
   * @param submitter The user submitting the request, who must be an admin.
   * @param name The name of the event type.
   * @param calendarIds An array of the calendars this event type is associated with.
   * @param organization The organization for which the event type is being created.
   * @param requiredMembers Determines if this event type has required members.
   * @param optionalMembers Determines if this event type has optional members.
   * @param teams Determines if this event type has teams.
   * @param teamType Determines if this event type has a team type.
   * @param location Determines if this event type has a location.
   * @param zoomLink Determines if this event type has a zoom link.
   * @param shop Determines if a shop is associated with this event type.
   * @param machinery Determines if machinery is associated with this event type.
   * @param workPackage Determines if a work package is associated with this event type.
   * @param questionDocument Determines if a question document is associated with this event type.
   * @param documents Determines if documents are associates with this event type.
   * @param description Determines if a description is associated with this event type.
   * @param onlyHeadsOrAbove Determines if events under this event type can only be created by heads or above.
   * @param requiredConfirmation Determines if events under this event type need to be confirmed.
   * @param sendSlackNotifications Determines if users will be notified via slack
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
    requiredMembers: boolean,
    optionalMembers: boolean,
    teams: boolean,
    teamType: boolean,
    location: boolean,
    zoomLink: boolean,
    shop: boolean,
    machinery: boolean,
    workPackage: boolean,
    questionDocument: boolean,
    documents: boolean,
    description: boolean,
    onlyHeadsOrAbove: boolean,
    requiresConfirmation: boolean,
    sendSlackNotifications: boolean
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

    const duplicate = await prisma.event_Type.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' }
      }
    });
    if (duplicate) {
      throw new HttpException(409, "Can't have two event types with the same name");
    }

    const newEventType = await prisma.event_Type.create({
      data: {
        name,
        calendars: {
          connect: calendarIds.map((calendarId) => ({ calendarId }))
        },
        userCreatedId: submitter.userId,
        requiredMembers,
        optionalMembers,
        teams,
        teamType,
        location,
        zoomLink,
        shop,
        machinery,
        workPackage,
        questionDocument,
        documents,
        description,
        onlyHeadsOrAboveForEventCreation: onlyHeadsOrAbove,
        requiresConfirmation,
        sendSlackNotifications,
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
  static async createMachinery(submitter: User, name: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create machinery');
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

    const created = await prisma.machinery.create({
      data: {
        name,
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId
      },
      ...getMachineryQueryArgs(organization.organizationId)
    });

    return machineryTransformer(created);
  }

  /**
   * Creates a new event.
   *
   * @param submitter The user submitting the request, who must be an admin.
   * @param title The title of the event.
   * @param eventTypeId The event type id the event is associated with.
   * @param organization The organization for which the event type is being created.
   * @param requiredMemberIds An array of required member ids that are invited to the event.
   * @param optionalMemberIds An array of optional member ids that are invited to the event.
   * @param teamIds An array of team ids that are invited to the event.
   * @param teamTypeId The team type id invited to the event.
   * @param shopIds An array of shops associated with the event.
   * @param machineryIds An array of machinery associated with the event.
   * @param workPackageIds An array of work packages associated with the event.
   * @param scheduleSlots An array of schedule slots associated with the event.
   * @param questionDocumentLink The link to the question document.
   * @param location Location of the event.
   * @param zoomLink Zoom Link if the event is online.
   * @param description Describes the event.
   *
   * @returns The created event.
   *
   * @throws NotFoundException If the given event type, member IDs, shop IDs, machinery IDs, work package IDs, document IDs, or approvedByUserId are not found.
   * @throws InvalidOrganizationException If the given event type, members, shops, machinery, work packages, or approvedByUserId are not part of the same organization.
   */
  static async createEvent(
    submitter: User,
    title: string,
    eventTypeId: string,
    organization: Organization,
    requiredMemberIds: string[],
    optionalMemberIds: string[],
    teamIds: string[],
    shopIds: string[],
    machineryIds: string[],
    workPackageIds: string[],
    scheduleSlot: ScheduleSlotCreateArgs[],
    teamTypeId?: string,
    questionDocumentLink?: string,
    location?: string,
    zoomLink?: string,
    description?: string
  ): Promise<Event> {
    // Validate eventTypeId
    const foundEventType = await prisma.event_Type.findUnique({
      where: { eventTypeId }
    });
    if (!foundEventType) throw new NotFoundException('Event Type', eventTypeId);
    if (foundEventType.dateDeleted) throw new DeletedException('Event Type', eventTypeId);
    if (foundEventType.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Event Type');
    }

    if (foundEventType.onlyHeadsOrAboveForEventCreation) {
      const hasPermission = await userHasPermission(submitter.userId, organization.organizationId, isHead);

      if (!hasPermission) {
        throw new AccessDeniedException('Only admins and heads can create events under this event type');
      }
    }

    // Validate event follows event type configuration
    validateEventTypeConfiguration(foundEventType, {
      requiredMemberIds,
      optionalMemberIds,
      teamIds,
      shopIds,
      machineryIds,
      workPackageIds,
      documents: [],
      scheduleSlot,
      teamTypeId,
      location,
      zoomLink,
      questionDocumentLink,
      description
    });

    // Validate required memberIds
    if (requiredMemberIds.length > 0) {
      const foundMembers = await prisma.user.findMany({
        where: {
          userId: { in: requiredMemberIds },
          organizations: { some: { organizationId: organization.organizationId } }
        }
      });
      if (foundMembers.length !== requiredMemberIds.length) {
        const missingIds = requiredMemberIds.filter((id) => !foundMembers.some((user) => user.userId === id));
        throw new NotFoundException('User', missingIds.join(', '));
      }
    }

    // Validate optionals memberIds
    if (optionalMemberIds.length > 0) {
      const foundMembers = await prisma.user.findMany({
        where: {
          userId: { in: optionalMemberIds },
          organizations: { some: { organizationId: organization.organizationId } }
        }
      });
      if (foundMembers.length !== optionalMemberIds.length) {
        const missingIds = optionalMemberIds.filter((id) => !foundMembers.some((user) => user.userId === id));
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
        },
        include: {
          shops: {
            include: {
              shop: true
            }
          }
        }
      });
      if (foundMachinery.length !== machineryIds.length) {
        const missingIds = machineryIds.filter((id) => !foundMachinery.some((m) => m.machineryId === id));
        throw new NotFoundException('Machinery', missingIds.join(', '));
      }

      // Automatically add machinery's shops to shopIds if not already included
      const machineryShopIds = foundMachinery.flatMap((m) => m.shops.map((sm) => sm.shopId));
      const uniqueShopIds = new Set([...shopIds, ...machineryShopIds]);
      shopIds = Array.from(uniqueShopIds);
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

    if (teamTypeId) {
      // Validate team type
      const foundTeamType = await prisma.team_Type.findUnique({
        where: {
          teamTypeId
        }
      });
      if (!foundTeamType) {
        throw new NotFoundException('Team Type', teamTypeId);
      }
    }

    // Check for conflicts
    const { hasConflict, approverUserId } = await checkEventConflicts(scheduleSlot, organization, location, undefined);

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
        requiredMembers: {
          connect: requiredMemberIds.map((userId) => ({ userId }))
        },
        optionalMembers: {
          connect: optionalMemberIds.map((userId) => ({ userId }))
        },
        teams: {
          connect: teamIds.map((teamId) => ({ teamId }))
        },
        teamTypeId,
        shops: {
          connect: shopIds.map((shopId) => ({ shopId }))
        },
        machinery: {
          connect: machineryIds.map((machineryId) => ({ machineryId }))
        },
        workPackages: {
          connect: workPackageIds.map((workPackageId) => ({ workPackageId }))
        },
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
        status: foundEventType.requiresConfirmation ? Event_Status.UNCONFIRMED : Event_Status.CONFIRMED,
        approved: !hasConflict,
        approvalRequiredFromUserId: hasConflict ? approverUserId : null,
        location,
        zoomLink,
        questionDocumentLink,
        description
      },
      ...getEventQueryArgs(organization.organizationId)
    });

    if (foundEventType.sendSlackNotifications) {
      const members = await prisma.user.findMany({
        where: { userId: { in: optionalMemberIds.concat(requiredMemberIds) } }
      });

      if (!members) {
        throw new NotFoundException('User', 'Cannot find members who are invited to the design review');
      }

      // get the user settings for all the members invited, who are leaderingship
      const memberUserSettings = await prisma.user_Settings.findMany({
        where: { userId: { in: members.map((member) => member.userId) } }
      });

      if (!memberUserSettings) {
        throw new NotFoundException('User Settings', 'Cannot find settings of members');
      }

      const workPackageNames = newEvent.workPackages.map((wp) => wp.wbsElement.name).join(', ');

      const projects = newEvent.workPackages.map((wp) => wp.project);

      // Send a slack message to all members invited to the event
      for (const memberUserSetting of memberUserSettings) {
        if (memberUserSetting.slackId) {
          try {
            // For each project associated with this event
            for (const project of projects) {
              await sendSlackEventConfirmNotification(
                memberUserSetting.slackId,
                newEvent.eventId,
                newEvent.title,
                project.wbsElement.name
              );
            }
          } catch (err: unknown) {
            if (err instanceof Error) {
              throw new HttpException(500, `Failed to send slack notification: ${err.message}`);
            }
          }
        }
      }

      if (newEvent.status === Event_Status.CONFIRMED) {
        await sendEventConfirmationToThread(newEvent.notificationSlackThreads, newEvent.userCreated);
      }

      // Send popup notification
      await sendEventPopUp(newEvent, members, submitter, workPackageNames, organization.organizationId);

      const createdEvent = eventTransformer(newEvent);

      for (const project of projects) {
        const projectTeams = project.teams;
        if (projectTeams.length > 0) {
          await sendSlackEventNotifications(
            projectTeams,
            createdEvent,
            submitter,
            workPackageNames,
            project.wbsElement.name
          );
        }
      }
      return createdEvent;
    }

    return eventTransformer(newEvent);
  }

  /**
   * Edits an event.
   *
   * @param submitter The user submitting the request, who must be an admin.
   * @param eventId The id of the event to edit.
   * @param title The title of the event.
   * @param organization The organization for which the event type is being created.
   * @param requiredMemberIds An array of required member ids that are invited to the event.
   * @param optionalMemberIds An array of optional member ids that are invited to the event.
   * @param status see Event_Status enum
   * @param teamIds An array of teams invited to the event.
   * @param teamType Team type Id invited to the event.
   * @param shopIds An array of shops associated with the event.
   * @param machineryIds An array of machinery associated with the event.
   * @param workPackageIds An array of work packages associated with the event.
   * @param documents An array of documents associated with the event.
   * @param scheduleSlots An array of schedule slots associated with the event.
   * @param questionDocumentLink The link to the question document.
   * @param location Location of the event.
   * @param zoomLink Zoom Link if the event is online.
   * @param description Describes the event.
   *
   * @returns The edited event.
   *
   * @throws NotFoundException If the given event type, member IDs, shop IDs, machinery IDs, work package IDs, document IDs, or approvedByUserId are not found.
   * @throws InvalidOrganizationException If the given event type, members, shops, machinery, work packages, or approvedByUserId are not part of the same organization.
   */
  static async editEvent(
    submitter: User,
    eventId: string,
    title: string,
    organization: Organization,
    requiredMemberIds: string[],
    optionalMemberIds: string[],
    status: Event_Status,
    teamIds: string[],
    shopIds: string[],
    machineryIds: string[],
    workPackageIds: string[],
    documents: EventDocumentCreateArgs[],
    scheduleSlot: ScheduleSlotCreateArgs[],
    teamTypeId?: string,
    questionDocumentLink?: string,
    location?: string,
    zoomLink?: string,
    description?: string
  ): Promise<Event> {
    // validate eventId
    const foundEvent = await prisma.event.findUnique({
      where: { eventId },
      ...getEventQueryArgs(organization.organizationId)
    });

    if (!foundEvent) throw new NotFoundException('Event', eventId);
    if (foundEvent.dateDeleted) throw new DeletedException('Event', eventId);

    const { eventTypeId } = foundEvent;
    const foundEventType = await prisma.event_Type.findUnique({
      where: { eventTypeId }
    });

    if (!foundEventType) throw new NotFoundException('Event Type', eventTypeId);
    if (foundEventType.dateDeleted) throw new DeletedException('Event Type', eventTypeId);

    // Validate event follows event type configuration
    validateEventTypeConfiguration(foundEventType, {
      requiredMemberIds,
      optionalMemberIds,
      teamIds,
      shopIds,
      machineryIds,
      workPackageIds,
      documents,
      scheduleSlot,
      teamTypeId,
      location,
      zoomLink,
      questionDocumentLink,
      description
    });

    // question document is required if the status is scheduled or done
    if (foundEventType.requiresConfirmation) {
      if (foundEvent.status === Event_Status.SCHEDULED || foundEvent.status === Event_Status.DONE) {
        if (questionDocumentLink == null) {
          throw new HttpException(400, 'doc template link is required for scheduled and done design reviews');
        }
      }
    }

    if (requiredMemberIds.length > 0 && requiredMemberIds.some((rMemberId) => optionalMemberIds.includes(rMemberId))) {
      throw new HttpException(400, 'required members cannot be in optional members');
    }

    if (foundEventType.onlyHeadsOrAboveForEventCreation) {
      const hasPermission = await userHasPermission(submitter.userId, organization.organizationId, isHead);

      if (!hasPermission) {
        throw new AccessDeniedException('Only admins and heads can edit this event!');
      }
    } else {
      const hasPermission =
        (await userHasPermission(submitter.userId, organization.organizationId, isHead)) ||
        submitter.userId === foundEvent.userCreatedId;

      if (!hasPermission) {
        throw new AccessDeniedException('Only admins and heads and creators can edit this event!');
      }
    }

    // Validate required memberIds
    if (requiredMemberIds.length > 0) {
      const foundMembers = await prisma.user.findMany({
        where: {
          userId: { in: requiredMemberIds },
          organizations: { some: { organizationId: organization.organizationId } }
        }
      });
      if (foundMembers.length !== requiredMemberIds.length) {
        const missingIds = requiredMemberIds.filter((id) => !foundMembers.some((user) => user.userId === id));
        throw new NotFoundException('User', missingIds.join(', '));
      }
    }

    // Validate optional memberIds
    if (optionalMemberIds.length > 0) {
      const foundMembers = await prisma.user.findMany({
        where: {
          userId: { in: optionalMemberIds },
          organizations: { some: { organizationId: organization.organizationId } }
        }
      });
      if (foundMembers.length !== optionalMemberIds.length) {
        const missingIds = optionalMemberIds.filter((id) => !foundMembers.some((user) => user.userId === id));
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
        },
        include: {
          shops: {
            include: {
              shop: true
            }
          }
        }
      });
      if (foundMachinery.length !== machineryIds.length) {
        const missingIds = machineryIds.filter((id) => !foundMachinery.some((m) => m.machineryId === id));
        throw new NotFoundException('Machinery', missingIds.join(', '));
      }

      // Automatically add machinery's shops to shopIds if not already included
      const machineryShopIds = foundMachinery.flatMap((m) => m.shops.map((sm) => sm.shopId));
      const uniqueShopIds = new Set([...shopIds, ...machineryShopIds]);
      shopIds = Array.from(uniqueShopIds);
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

    if (teamTypeId) {
      // Validate team type
      const foundTeamType = await prisma.team_Type.findMany({
        where: {
          teamTypeId
        }
      });
      if (!foundTeamType) {
        throw new NotFoundException('Team Type', teamTypeId);
      }
    }

    // Use transaction for the update
    const updatedEvent = await prisma.$transaction(async (tx) => {
      // Fetch existing schedule slots
      const [existingSlots] = await Promise.all([
        tx.schedule_Slot.findMany({
          where: { ScheduledEvents: { some: { eventId } } },
          select: {
            days: true,
            startTime: true,
            endTime: true,
            recurrenceNumber: true,
            initialDateScheduled: true,
            allDay: true
          }
        })
      ]);

      // Checks if all schedule slots are the same (ie no changes)
      const haveDifferentSlots = (a: typeof existingSlots, b: typeof scheduleSlot) => {
        if (a.length !== b.length) return true;
        return a.some((oldSlot, idx) => {
          const newSlot = b[idx];
          return (
            oldSlot.days !== newSlot.days ||
            oldSlot.startTime !== newSlot.startTime ||
            oldSlot.endTime !== newSlot.endTime ||
            oldSlot.recurrenceNumber !== newSlot.recurrenceNumber ||
            oldSlot.initialDateScheduled !== newSlot.initialDateScheduled ||
            oldSlot.allDay !== newSlot.allDay
          );
        });
      };

      const computeEndDate = (initial: Date, recurrenceNumber: number) => {
        const weeks = Math.max(1, recurrenceNumber ?? 0);
        return new Date(initial.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
      };

      const scheduleChanged = haveDifferentSlots(existingSlots, scheduleSlot);
      const locationChanged = foundEvent.location !== location;

      let hasConflict = false;
      let approverUserId: string | undefined;

      if (scheduleChanged || locationChanged) {
        const { hasConflict: conflict, approverUserId: approver } = await checkEventConflicts(
          scheduleSlot,
          organization,
          location,
          eventId
        );

        hasConflict = conflict;
        approverUserId = approver;
      }

      if (scheduleChanged) {
        await tx.schedule_Slot.deleteMany({
          where: { ScheduledEvents: { some: { eventId } } }
        });
        await Promise.all(
          scheduleSlot.map((s) =>
            tx.schedule_Slot.create({
              data: {
                days: s.days,
                startTime: s.startTime ?? null,
                endDate: computeEndDate(s.initialDateScheduled, s.recurrenceNumber),
                recurrenceNumber: s.recurrenceNumber,
                initialDateScheduled: s.initialDateScheduled,
                allDay: s.allDay,
                ScheduledEvents: { connect: { eventId } }
              }
            })
          )
        );
      }

      // throw if a user isn't found, then build prisma queries for connecting userIds
      const updatedRequiredMembers = getPrismaQueryUserIds(await getUsers(requiredMemberIds));
      const updatedOptionalMembers = getPrismaQueryUserIds(await getUsers(optionalMemberIds));

      let newStatus = status;

      // If schedule or location changed and event type requires confirmation, reset to UNCONFIRMED
      if ((scheduleChanged || locationChanged) && foundEventType.requiresConfirmation) {
        newStatus = Event_Status.UNCONFIRMED;
      } else {
        // If all required members are confirmed, set the status to SCHEDULED
        const allRequiredMembersConfirmed = updatedRequiredMembers.every((member) =>
          foundEvent.confirmedMembers.map((user) => user.userId).includes(member.userId)
        );

        if (status === Event_Status.CONFIRMED && allRequiredMembersConfirmed) {
          newStatus = Event_Status.SCHEDULED;
        }
      }

      // Update the event with new data
      return await tx.event.update({
        where: { eventId },
        data: {
          title,
          eventTypeId,
          requiredMembers: {
            set: updatedRequiredMembers
          },
          optionalMembers: {
            set: updatedOptionalMembers
          },
          teams: {
            set: teamIds.map((teamId) => ({ teamId }))
          },
          ...(teamTypeId !== undefined && { teamTypeId }),
          status: newStatus,
          shops: {
            set: shopIds.map((shopId) => ({ shopId }))
          },
          machinery: {
            set: machineryIds.map((machineryId) => ({ machineryId }))
          },
          workPackages: {
            set: workPackageIds.map((workPackageId) => ({ workPackageId }))
          },
          // If schedule/location changed and there's a conflict, set approved=false and track who needs to approve
          // Otherwise keep existing approval state
          approved: scheduleChanged || locationChanged ? !hasConflict : foundEvent.approved,
          approvalRequiredFromUserId:
            scheduleChanged || locationChanged
              ? hasConflict
                ? approverUserId
                : null
              : foundEvent.approvalRequiredFromUserId,
          location,
          zoomLink,
          questionDocumentLink,
          description
        },
        ...getEventQueryArgs(organization.organizationId)
      });
    });

    //set any deleted documents with a dateDeleted
    await removeDeletedEventDocuments(documents, foundEvent.documents || [], submitter);

    const edittedEvent = eventTransformer(updatedEvent);

    if (status === Event_Status.SCHEDULED && foundEventType.sendSlackNotifications) {
      await sendEventScheduledSlackNotif(updatedEvent.notificationSlackThreads, edittedEvent);
    }

    if (status === Event_Status.CONFIRMED && foundEventType.sendSlackNotifications) {
      await sendEventConfirmationToThread(updatedEvent.notificationSlackThreads, updatedEvent.userCreated);
    }

    return edittedEvent;
  }

  /**
   * Service function to upload a picture to the event documents folder in the NER google drive
   * @param eventId id for the event we're tying the document to
   * @param file The file data for the image
   * @param submitter user who is uploading the document
   * @param organizationId the organization the user is currently in
   * @returns the google drive id for the file
   */
  static async uploadDocument(eventId: string, file: Express.Multer.File, submitter: User, organization: Organization) {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('Guests cannot upload documents');

    const event = await prisma.event.findUnique({
      where: { eventId }
    });

    const numDocuments = await prisma.document.count({
      where: {
        documentEvent: {
          eventType: {
            organizationId: organization.organizationId
          }
        }
      }
    });

    if (!event) throw new NotFoundException('Event', eventId);
    if (event.dateDeleted) {
      throw new DeletedException('Event', eventId);
    }
    if (event.userCreatedId !== submitter.userId && !isHead) {
      throw new AccessDeniedException('You do not have access to upload a document for this event');
    }

    file.filename = 'document' + numDocuments;
    const documentData = await uploadFile(file);

    if (!documentData?.name) {
      throw new HttpException(500, 'Document Name not found');
    }

    const document = await prisma.document.create({
      data: {
        googleFileId: documentData.id,
        name: documentData.name,
        documentEventId: eventId,
        createdByUserId: submitter.userId
      }
    });

    return document;
  }

  /**
   * Downloads the document file with the given google file id
   *
   * @param fileId the google file id of the document
   * @returns a buffer of the image data and the image type
   */
  static async downloadDocument(fileId: string) {
    const fileData = await downloadFile(fileId);

    if (!fileData) throw new NotFoundException('Image File', fileId);
    return fileData;
  }

  /**
   * Approve event in the database
   * @param submitter The user submitting the request who must be a head or above.
   * @param eventId The id of the given event.
   * @param organization The organization for which the event is being deleted.
   *
   * @returns The approved event.
   *
   * @throws NotFoundException If the given eventId is not found.
   * @throws InvalidOrganizationException If the given eventId is not part of the same organization.
   * @throws DeletedException If the event has already been deleted.
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin or head.
   */
  static async approveEvent(submitter: User, eventId: string, organization: Organization): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { eventId }
    });

    if (!event) throw new NotFoundException('Event', eventId);
    if (event.dateDeleted) throw new DeletedException('Event', eventId);

    const hasPermission =
      (await userHasPermission(submitter.userId, organization.organizationId, isHead)) ||
      event.approvalRequiredFromUserId === submitter.userId;

    if (!hasPermission) {
      throw new AccessDeniedException('Only admins or heads or the owner of the conflicting event can this approve event!');
    }

    const approvedEvent = await prisma.event.update({
      where: { eventId },
      data: {
        approved: true,
        approvalRequiredFromUserId: submitter.userId
      },
      ...getEventQueryArgs(organization.organizationId)
    });

    return eventTransformer(approvedEvent);
  }

  /**
   * Edits an event by confirming a given user's availability and also updating their schedule settings with the given availability
   * @param submitter the member that is being confirmed
   * @param eventId the id of the event
   * @param availabilities the given member's availabilities
   * @param organizationId the organization that the user is currently in
   * @returns the modified event with its updated confirmed members
   */
  static async markUserConfirmed(
    eventId: string,
    availabilities: AvailabilityCreateArgs[],
    submitter: UserWithSettings,
    organization: Organization
  ): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { eventId },
      ...getEventQueryArgs(organization.organizationId)
    });

    if (!event) throw new NotFoundException('Event', eventId);
    if (event.dateDeleted) throw new DeletedException('Event', eventId);

    if (!isUserOnEvent(submitter, eventTransformer(event)))
      throw new HttpException(400, 'Current user is not in the list of this events members');

    let userSettings = await prisma.schedule_Settings.findUnique({
      where: { userId: submitter.userId },
      ...getUserScheduleSettingsQueryArgs()
    });

    if (!userSettings) {
      userSettings = await prisma.schedule_Settings.create({
        data: {
          userId: submitter.userId,
          availabilities: {
            createMany: {
              data: availabilities.map((availability) => ({
                availability: availability.availability,
                dateSet: availability.dateSet
              }))
            }
          },
          personalGmail: '',
          personalZoomLink: ''
        },
        ...getUserScheduleSettingsQueryArgs()
      });
    }

    await updateUserAvailability(availabilities, userSettings, submitter);

    // set submitter as confirmed if they're not already
    if (!event.confirmedMembers.map((user) => user.userId).includes(submitter.userId)) {
      const updatedEvent = await prisma.event.update({
        where: { eventId },
        ...getEventQueryArgs(organization.organizationId),
        data: {
          confirmedMembers: {
            connect: {
              userId: submitter.userId
            }
          }
        }
      });

      const { eventTypeId } = updatedEvent;
      const foundEventType = await prisma.event_Type.findUnique({
        where: { eventTypeId }
      });

      if (!foundEventType) throw new NotFoundException('Event Type', eventTypeId);
      if (foundEventType.dateDeleted) throw new DeletedException('Event Type', eventTypeId);

      if (foundEventType.sendSlackNotifications) {
        await sendEventUserConfirmationToThread(updatedEvent.notificationSlackThreads, submitter);
      }

      // If all required attendees have confirmed their schedule and this member was a required attendee, mark design review as confirmed
      if (
        areUsersinList(event.requiredMembers, updatedEvent.confirmedMembers) &&
        areUsersinList([submitter], event.requiredMembers)
      ) {
        await prisma.event.update({
          where: { eventId },
          ...getEventQueryArgs(organization.organizationId),
          data: {
            status: Event_Status.CONFIRMED
          }
        });
        if (foundEventType.sendSlackNotifications) {
          await sendEventConfirmationToThread(updatedEvent.notificationSlackThreads, updatedEvent.userCreated);
        }
      }

      return eventTransformer(updatedEvent);
    }
    return eventTransformer(event);
  }

  /**
   * Sets the status of an event, only admin or the user who created the event can set the status.
   * @param user the user trying to set the status
   * @param eventId the id of the event
   * @param status the status to set the event to
   * @param organizationId the organization that the user is currently in
   * @returns the modified event
   */
  static async setStatus(user: User, eventId: string, status: EventStatus, organization: Organization): Promise<Event> {
    // validate the design review exists and is not deleted
    const originalEvent = await prisma.event.findUnique({
      where: { eventId }
    });
    if (!originalEvent) throw new NotFoundException('Event', eventId);
    if (originalEvent.dateDeleted) throw new DeletedException('Event', eventId);

    // verify user is allowed to set the status of the event
    if (
      !(await userHasPermission(user.userId, organization.organizationId, isAdmin)) &&
      user.userId !== originalEvent.userCreatedId
    ) {
      throw new AccessDeniedAdminOnlyException('set the status of an event');
    }

    // actually try to update the event
    const updatedEvent = await prisma.event.update({
      where: { eventId },
      ...getEventQueryArgs(organization.organizationId),
      data: {
        status
      }
    });

    return eventTransformer(updatedEvent);
  }

  /**
   * Delete event in the database
   * @param submitter The user submitting the request, who must be an admin.
   * @param eventId The id of the given event.
   * @param organization The organization for which the event is being deleted.
   *
   * @returns The deleted event.
   *
   * @throws NotFoundException If the given eventId is not found.
   * @throws InvalidOrganizationException If the given eventId is not part of the same organization.
   * @throws DeletedException If the event has already been deleted.
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   */
  static async deleteEvent(submitter: User, eventId: string, organization: Organization): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { eventId }
    });

    if (!event) throw new NotFoundException('Event', eventId);
    if (event.dateDeleted) throw new DeletedException('Event', eventId);

    const hasPermission =
      (await userHasPermission(submitter.userId, organization.organizationId, isAdmin)) ||
      submitter.userId === event.userCreatedId;

    if (!hasPermission) {
      throw new AccessDeniedException('Only admins can delete events!');
    }

    const deletedEvent = await prisma.event.update({
      where: { eventId },
      data: { dateDeleted: new Date(), userDeletedId: submitter.userId },
      ...getEventQueryArgs(organization.organizationId)
    });

    return eventTransformer(deletedEvent);
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
  static async editMachinery(submitter: User, machineryId: string, name: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads and above can edit machinery');
    }

    const existing = await prisma.machinery.findFirst({ where: { machineryId } });
    if (!existing) throw new NotFoundException('Machinery', machineryId);
    if (existing.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Machinery');
    }
    if (existing.dateDeleted) {
      throw new NotFoundException('Machinery', machineryId);
    }

    // manual uniqueness excluding current record
    const duplicate = await prisma.machinery.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' },
        NOT: { machineryId }
      }
    });
    if (duplicate) {
      throw new HttpException(409, "Can't have two machinery with the same name");
    }

    const updated = await prisma.machinery.update({
      where: { machineryId },
      data: { name },
      ...getMachineryQueryArgs(organization.organizationId)
    });

    return machineryTransformer(updated);
  }

  /**
   * Adds or updates a machinery to a shop. Handles consolidation when machinery name matches existing machinery.
   * If quantity is 0, deletes the shop-machinery relationship (only applicable to editing the machinery modal).
   *
   * @param submitter The user submitting the request, who must be a head or above.
   * @param machineryId The ID of the machinery to add/update.
   * @param shopId The ID of the shop to add/update the machinery in.
   * @param quantity The quantity of machinery. If 0, the relationship is deleted.
   * @param organization The organization context.
   * @param originalShopId Optional: The original shop ID when moving/updating an existing relationship. If not provided, this is treated as an "add" operation and quantities are incremented.
   * @returns The machinery object with updated shop relationships.
   * @throws AccessDeniedException If the submitter is not a head or above.
   * @throws NotFoundException If the machinery or shop with the given IDs do not exist.
   * @throws InvalidOrganizationException If the machinery or shop does not belong to the same organization.
   */
  static async addMachineryToShop(
    submitter: User,
    machineryId: string,
    shopId: string,
    quantity: number,
    organization: Organization,
    originalShopId?: string
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads and above can manage shop-machinery relationships');
    }

    const existingMachinery = await prisma.machinery.findUnique({
      where: { machineryId }
    });

    if (!existingMachinery) {
      throw new NotFoundException('Machinery', machineryId);
    }

    if (existingMachinery.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Machinery');
    }

    const existingShop = await prisma.shop.findUnique({
      where: { shopId }
    });

    if (!existingShop) {
      throw new NotFoundException('Shop', shopId);
    }

    if (existingShop.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Shop');
    }

    // Use a transaction to ensure all database operations complete atomically.
    // This is critical for consolidation logic where we may delete one machinery and merge into another.
    const updatedMachinery = await prisma.$transaction(async (tx) => {
      // Find the specific shop-machinery relationship being edited (if updating existing)
      // This identifies which shop's quantity/relationship we're modifying
      let shopMachineryToUpdate;
      if (originalShopId) {
        shopMachineryToUpdate = await tx.shop_Machinery.findFirst({
          where: {
            machineryId,
            shopId: originalShopId
          }
        });
      }

      // Get the machinery name to check for consolidation
      const machineryName = existingMachinery.name;

      // Check if another machinery with the same name already exists
      const existingMachineryWithSameName = await tx.machinery.findFirst({
        where: {
          name: machineryName,
          organizationId: organization.organizationId,
          machineryId: { not: existingMachinery.machineryId }
        },
        include: {
          shops: {
            where: { shopId }
          }
        }
      });

      // Case 1: Same name + same shop as existing machinery (consolidation)
      // Consolidate by deleting current relationship and adding quantity to existing one
      if (existingMachineryWithSameName && existingMachineryWithSameName.shops.length > 0) {
        const [existingShopMachinery] = existingMachineryWithSameName.shops;

        // If we're consolidating into a different shop-machinery relationship
        if (
          shopMachineryToUpdate &&
          (shopMachineryToUpdate.shopMachineryId !== existingShopMachinery.shopMachineryId ||
            existingMachineryWithSameName.machineryId !== machineryId)
        ) {
          await tx.shop_Machinery.delete({
            where: { shopMachineryId: shopMachineryToUpdate.shopMachineryId }
          });

          // Handle quantity: if 0, delete; otherwise add to existing
          if (quantity === 0) {
            await tx.shop_Machinery.delete({
              where: { shopMachineryId: existingShopMachinery.shopMachineryId }
            });
          } else {
            const newQuantity = existingShopMachinery.quantity + quantity;
            await tx.shop_Machinery.update({
              where: { shopMachineryId: existingShopMachinery.shopMachineryId },
              data: { quantity: newQuantity }
            });
          }

          // Note: Machinery is kept even if it has no more shops
          // Only shop-machinery relationships are deleted, not the machinery itself
        } else if (
          shopMachineryToUpdate &&
          shopMachineryToUpdate.shopMachineryId === existingShopMachinery.shopMachineryId
        ) {
          // Same relationship - just update the quantity (edit operation)
          if (quantity === 0) {
            await tx.shop_Machinery.delete({
              where: { shopMachineryId: existingShopMachinery.shopMachineryId }
            });
          } else {
            await tx.shop_Machinery.update({
              where: { shopMachineryId: existingShopMachinery.shopMachineryId },
              data: { quantity }
            });
          }
        } else if (shopMachineryToUpdate) {
          // Different relationship - delete old and add to existing
          await tx.shop_Machinery.delete({
            where: { shopMachineryId: shopMachineryToUpdate.shopMachineryId }
          });

          if (quantity === 0) {
            // If quantity is 0, just delete the existing relationship too
            await tx.shop_Machinery.delete({
              where: { shopMachineryId: existingShopMachinery.shopMachineryId }
            });
          } else {
            // Add quantity to existing relationship
            const newQuantity = existingShopMachinery.quantity + quantity;
            await tx.shop_Machinery.update({
              where: { shopMachineryId: existingShopMachinery.shopMachineryId },
              data: { quantity: newQuantity }
            });
          }
        } else if (quantity === 0) {
          // Add operation - if quantity is 0, delete the relationship
          await tx.shop_Machinery.delete({
            where: { shopMachineryId: existingShopMachinery.shopMachineryId }
          });
        } else {
          // Add operation - increment quantity
          const newQuantity = existingShopMachinery.quantity + quantity;
          await tx.shop_Machinery.update({
            where: { shopMachineryId: existingShopMachinery.shopMachineryId },
            data: { quantity: newQuantity }
          });
        }

        const resultMachinery = await tx.machinery.findUnique({
          where: { machineryId: existingMachineryWithSameName.machineryId },
          ...getMachineryQueryArgs(organization.organizationId)
        });
        if (!resultMachinery) {
          throw new NotFoundException('Machinery', existingMachineryWithSameName.machineryId);
        }
        return resultMachinery;
      }

      // Case 2: Name matches existing machinery but different shop
      // Move relationship to the existing machinery but with different shop
      if (existingMachineryWithSameName && existingMachineryWithSameName.machineryId !== machineryId) {
        if (shopMachineryToUpdate) {
          await tx.shop_Machinery.delete({
            where: { shopMachineryId: shopMachineryToUpdate.shopMachineryId }
          });
        }

        // Check if existing machinery already has this shop
        const existingShopMachinery = await tx.shop_Machinery.findUnique({
          where: {
            uniqueShopMachinery: {
              shopId,
              machineryId: existingMachineryWithSameName.machineryId
            }
          }
        });

        if (quantity === 0) {
          // If quantity is 0 and relationship exists, delete it
          if (existingShopMachinery) {
            await tx.shop_Machinery.delete({
              where: { shopMachineryId: existingShopMachinery.shopMachineryId }
            });
          }
        } else if (existingShopMachinery) {
          // Add quantity to existing relationship
          const newQuantity = existingShopMachinery.quantity + quantity;
          await tx.shop_Machinery.update({
            where: { shopMachineryId: existingShopMachinery.shopMachineryId },
            data: { quantity: newQuantity }
          });
        } else {
          // Create new relationship for existing machinery
          await tx.shop_Machinery.create({
            data: {
              shopId,
              machineryId: existingMachineryWithSameName.machineryId,
              quantity
            }
          });
        }

        // Note: Machinery is kept even if it has no more shops
        // Only shop-machinery relationships are deleted, not the machinery itself

        const resultMachinery = await tx.machinery.findUnique({
          where: { machineryId: existingMachineryWithSameName.machineryId },
          ...getMachineryQueryArgs(organization.organizationId)
        });
        if (!resultMachinery) {
          throw new NotFoundException('Machinery', existingMachineryWithSameName.machineryId);
        }
        return resultMachinery;
      }

      // Case 3: Normal update - no consolidation needed
      if (shopMachineryToUpdate) {
        if (shopMachineryToUpdate.shopId === shopId) {
          // Same shop, update quantity or delete if 0
          if (quantity === 0) {
            await tx.shop_Machinery.delete({
              where: { shopMachineryId: shopMachineryToUpdate.shopMachineryId }
            });
          } else {
            await tx.shop_Machinery.update({
              where: { shopMachineryId: shopMachineryToUpdate.shopMachineryId },
              data: { quantity }
            });
          }
        } else {
          // Different shop - check if target shop already has this machinery
          const existingRelationship = await tx.shop_Machinery.findUnique({
            where: {
              uniqueShopMachinery: {
                shopId,
                machineryId
              }
            }
          });

          if (existingRelationship) {
            // Target shop already has this machinery, update it and delete old relationship
            if (quantity === 0) {
              await tx.shop_Machinery.delete({
                where: { shopMachineryId: existingRelationship.shopMachineryId }
              });
            } else {
              await tx.shop_Machinery.update({
                where: { shopMachineryId: existingRelationship.shopMachineryId },
                data: { quantity }
              });
            }
            await tx.shop_Machinery.delete({
              where: { shopMachineryId: shopMachineryToUpdate.shopMachineryId }
            });
          } else if (quantity === 0) {
            // Move relationship to new shop, but quantity is 0 so delete
            await tx.shop_Machinery.delete({
              where: { shopMachineryId: shopMachineryToUpdate.shopMachineryId }
            });
          } else {
            // Move relationship to new shop
            await tx.shop_Machinery.update({
              where: { shopMachineryId: shopMachineryToUpdate.shopMachineryId },
              data: {
                shopId,
                quantity
              }
            });
          }
        }
      } else {
        // No originalShopId - this is a create operation (adding machine to shop)
        // Check if relationship already exists
        const existingRelationship = await tx.shop_Machinery.findUnique({
          where: {
            uniqueShopMachinery: {
              shopId,
              machineryId
            }
          }
        });

        if (existingRelationship) {
          // Relationship exists - add quantities together when creating
          if (quantity === 0) {
            await tx.shop_Machinery.delete({
              where: { shopMachineryId: existingRelationship.shopMachineryId }
            });
          } else {
            const newQuantity = existingRelationship.quantity + quantity;
            await tx.shop_Machinery.update({
              where: { shopMachineryId: existingRelationship.shopMachineryId },
              data: { quantity: newQuantity }
            });
          }
        } else if (quantity > 0) {
          // Create new relationship only if quantity > 0
          await tx.shop_Machinery.create({
            data: {
              shopId,
              machineryId,
              quantity
            }
          });
        }
      }

      // Note: Machinery is kept even if quantity is 0 and it has no more shops
      // Only shop-machinery relationships are deleted, not the machinery itself

      const updatedMachineryResult = await tx.machinery.findUnique({
        where: { machineryId },
        ...getMachineryQueryArgs(organization.organizationId)
      });
      if (!updatedMachineryResult) throw new NotFoundException('Machinery', machineryId);
      return updatedMachineryResult;
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
   * @param schedule Determines if a date is associated with this event type.
   * @param requiredMembers Determines if this event type has required members.
   * @param optionalMembers Determines if this event type has optional members.
   * @param teams Determines if this event type has teams.
   * @param teamType Determines if this event type has team types.
   * @param location Determines if this event type has a location.
   * @param zoomLink Determines if this event type has a zoom link.
   * @param shop Determines if a shop is associated with this event type.
   * @param machinery Determines if machinery is associated with this event type.
   * @param workPackage Determines if a work package is associated with this event type.
   * @param questionDocument Determines if a question document is associated with this event type.
   * @param documents Determines if documents are associates with this event type.
   * @param description Determines if a description is associated with this event type.
   * @param onlyHeadsOrAbove Determines if events associated with this event type can only be made by heads or above.
   * @param requiredConfirmation Determines if events associated with this event type need to be confirmed.
   * @param sendSlackNotifications Determines if events associated with this event type should receive slack notifications.
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
    name: string,
    requiredMembers: boolean,
    optionalMembers: boolean,
    teams: boolean,
    teamType: boolean,
    location: boolean,
    zoomLink: boolean,
    shop: boolean,
    machinery: boolean,
    workPackage: boolean,
    questionDocument: boolean,
    documents: boolean,
    description: boolean,
    onlyHeadsOrAbove: boolean,
    requiresConfirmation: boolean,
    sendSlackNotifications: boolean
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
    const oldEventType = await prisma.event_Type.findUnique({
      where: {
        eventTypeId,
        organizationId: organization.organizationId
      }
    });

    if (!oldEventType) throw new NotFoundException('Event Type', eventTypeId);
    if (oldEventType.dateDeleted) throw new DeletedException('Event Type', eventTypeId);

    const updatedEventType = await prisma.event_Type.update({
      where: { eventTypeId: oldEventType.eventTypeId },
      data: {
        name,
        calendars: {
          set: calendarIds.map((calendarId) => ({ calendarId }))
        },
        requiredMembers,
        optionalMembers,
        teams,
        teamType,
        location,
        zoomLink,
        shop,
        machinery,
        workPackage,
        questionDocument,
        documents,
        description,
        onlyHeadsOrAboveForEventCreation: onlyHeadsOrAbove,
        requiresConfirmation,
        sendSlackNotifications
      },
      ...getEventTypeQueryArgs(organization.organizationId)
    });

    return eventTypeTransformer(updatedEventType);
  }

  /**
   * Delete event type in the database
   * @param submitter The user submitting the request, who must be an admin.
   * @param eventTypeId The id of the given event type.
   * @param organization The organization for which the event type is being deleted.
   *
   * @returns The deleted event type.
   *
   * @throws NotFoundException If the given event type is not found.
   * @throws InvalidOrganizationException If the given eventTypeId is not part of the same organization.
   * @throws DeletedException If the event type has already been deleted.
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   */
  static async deleteEventType(submitter: User, eventTypeId: string, organization: Organization): Promise<EventType> {
    const eventType = await prisma.event_Type.findUnique({
      where: { eventTypeId }
    });

    if (!eventType) throw new NotFoundException('Event Type', eventTypeId);
    if (eventType.dateDeleted) throw new DeletedException('Event Type', eventTypeId);
    if (eventType.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Event Type');

    const hasPermission = await userHasPermission(submitter.userId, organization.organizationId, isAdmin);

    if (!hasPermission) {
      throw new AccessDeniedException('Only admins can delete event types!');
    }

    const deletedEventType = await prisma.event_Type.update({
      where: { eventTypeId },
      data: { dateDeleted: new Date(), userDeletedId: submitter.userId },
      ...getEventTypeQueryArgs(organization.organizationId)
    });

    return eventTypeTransformer(deletedEventType);
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
      await tx.shop_Machinery.deleteMany({ where: { shopId } });

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
      const foundEventTypes = await prisma.event_Type.findMany({
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
            { requiredMembers: { some: { userId: { in: memberIds } } } }, // attendee
            { optionalMembers: { some: { userId: { in: memberIds } } } },
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

  static async getAllMachinery(organization: Organization): Promise<Machinery[]> {
    const list = await prisma.machinery.findMany({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null
      },
      ...getMachineryQueryArgs(organization.organizationId)
    });
    return list.map(machineryTransformer);
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
      await tx.shop_Machinery.deleteMany({
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

  /**
   * Retrieves a single event
   *
   * @param submitter the user who is trying to retrieve the event
   * @param designReviewId the id of the event to retrieve
   * @param organizationId the organization that the user is currently in
   * @returns the event
   */
  static async getSingleEvent(_submitter: User, eventId: string, organization: Organization): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { eventId },
      ...getEventQueryArgs(organization.organizationId)
    });

    if (!event) throw new NotFoundException('Event', eventId);

    if (event.dateDeleted) throw new DeletedException('Event', eventId);

    return eventTransformer(event);
  }

  /**
   * Gets all events in the database
   * @param organizationId the organization id of the current user
   * @returns All of the events
   */
  static async getAllEvents(organization: Organization): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: { dateDeleted: null },
      ...getEventQueryArgs(organization.organizationId)
    });
    return events.map(eventTransformer);
  }

  /**
   * Gets all event types in the database
   * @param organization the organization the user is currently in
   * @returns All of the event types
   */
  static async getAllEventTypes(organization: Organization): Promise<EventType[]> {
    const eventTypes = await prisma.event_Type.findMany({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null
      },
      ...getEventTypeQueryArgs(organization.organizationId)
    });
    return eventTypes.map(eventTypeTransformer);
  }
}
