import {
  User,
  isAdmin,
  isHead,
  isGuest,
  AvailabilityCreateArgs,
  Event,
  EventType,
  ScheduleSlotCreateArgs,
  EventDocumentCreateArgs,
  EventStatus,
  Shop,
  Calendar,
  FilterArgs,
  Machinery,
  ScheduleSlot,
  notGuest,
  isSameDay
} from 'shared';
import { getCalendarQueryArgs } from '../prisma-query-args/calendar.query-args.js';
import { getEventTypeQueryArgs } from '../prisma-query-args/event-type.query-args.js';
import { getEventQueryArgs, getEventWithMembersQueryArgs } from '../prisma-query-args/event.query-args.js';
import { getMachineryQueryArgs } from '../prisma-query-args/machinery.query-args.js';
import { getShopQueryArgs } from '../prisma-query-args/shop.query-args.js';
import { getUserScheduleSettingsQueryArgs } from '../prisma-query-args/user.query-args.js';
import prisma from '../prisma/prisma.js';
import {
  eventTypeTransformer,
  machineryTransformer,
  eventTransformer,
  eventWithMembersTransformer,
  shopTransformer,
  calendarTransformer
} from '../transformers/calendar.transformer.js';
import { UserWithSettings } from '../utils/auth.utils.js';
import {
  validateEventTypeConfiguration,
  checkEventConflicts,
  removeDeletedEventDocuments,
  isUserOnEvent,
  buildScheduledTimesOverlap,
  findMatchingTimeOfDaySlots
} from '../utils/calendar.utils.js';
import {
  AccessDeniedAdminOnlyException,
  NotFoundException,
  InvalidOrganizationException,
  HttpException,
  DeletedException,
  AccessDeniedException,
  AccessDeniedGuestException
} from '../utils/errors.utils.js';
import { createCalendarEvent, uploadFile, downloadFile, deleteCalendarEvents } from '../utils/google-integration.utils.js';
import { sendEventPopUp } from '../utils/pop-up.utils.js';
import {
  sendSlackEventConfirmNotification,
  sendEventConfirmationToThread,
  sendSlackEventNotifications,
  sendEventScheduledSlackNotif,
  sendEventUserConfirmationToThread
} from '../utils/slack.utils.js';
import {
  userHasPermission,
  getPrismaQueryUserIds,
  getUsers,
  updateUserAvailability,
  areUsersinList
} from '../utils/users.utils.js';
import { Conflict_Status, Event_Status, Organization, Team } from '@prisma/client';

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
    requiresConfirmation: boolean
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
   * @param sendSlackNotifications Determines if this event should receive slack notifications.
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
    scheduleSlots: ScheduleSlotCreateArgs[],
    initialDateScheduled: Date | undefined,
    sendSlackNotifications: boolean,
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
    } else if (!(await userHasPermission(submitter.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedGuestException('create events');
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
      scheduleSlots,
      initialDateScheduled,
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

    // Check for conflicts using expanded slots
    const { hasConflict, conflictingEvent } = await checkEventConflicts(scheduleSlots, organization, location, undefined);

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
          create: scheduleSlots.map((s) => ({
            startTime: s.startTime ?? null,
            endTime: s.endTime ?? null,
            allDay: s.allDay
          }))
        },
        initialDateScheduled,
        status: foundEventType.requiresConfirmation ? Event_Status.UNCONFIRMED : Event_Status.SCHEDULED,
        approved: hasConflict ? Conflict_Status.PENDING : Conflict_Status.NO_CONFLICT,
        approvalRequiredFromUserId: hasConflict ? conflictingEvent?.userCreated.userId : null,
        location,
        zoomLink,
        questionDocumentLink,
        description,
        sendSlackNotifications
      },
      ...getEventQueryArgs(organization.organizationId)
    });

    const createdEvent = eventTransformer(newEvent);

    let calendarEventIds: string[] = [];
    if (process.env.NODE_ENV === 'production') {
      try {
        const allMemberIds = [...requiredMemberIds, ...optionalMemberIds];
        const isInPerson = !!location;

        calendarEventIds = await createCalendarEvent(
          process.env.GOOGLE_CALENDAR_ID!,
          allMemberIds,
          newEvent.scheduledTimes,
          isInPerson,
          zoomLink ?? null,
          location ?? null,
          title
        );

        // Update event with calendar IDs
        await prisma.event.update({
          where: { eventId: newEvent.eventId },
          data: { calendarEventIds }
        });
      } catch (error) {
        console.error('Failed to create Google Calendar events:', error);
      }
    }

    if (sendSlackNotifications) {
      const members = await prisma.user.findMany({
        where: { userId: { in: optionalMemberIds.concat(requiredMemberIds) } }
      });

      // get the user settings for all the members invited, who are leaderingship
      const memberUserSettings = await prisma.user_Settings.findMany({
        where: { userId: { in: members.map((member) => member.userId) } }
      });

      const workPackageNames = newEvent.workPackages.map((wp) => wp.wbsElement.name).join(', ');

      const projects = newEvent.workPackages.map((wp) => wp.project);

      // Send a slack message to all members invited to the event if the event requires confirmation
      if (newEvent.status === Event_Status.UNCONFIRMED) {
        for (const memberUserSetting of memberUserSettings) {
          if (memberUserSetting.slackId) {
            await sendSlackEventConfirmNotification(
              memberUserSetting.slackId,
              newEvent.eventId,
              newEvent.title,
              projects.map((project) => project.wbsElement.name).join(', ')
            );
          }
        }
      }

      // Send popup notification
      await sendEventPopUp(newEvent, members, submitter, workPackageNames, organization.organizationId);

      const teamsToNotify = new Set<Team>();
      for (const project of projects) {
        for (const team of project.teams) {
          teamsToNotify.add(team);
        }
      }

      for (const team of newEvent.teams) {
        teamsToNotify.add(team);
      }

      await sendSlackEventNotifications(
        Array.from(teamsToNotify),
        createdEvent,
        submitter,
        workPackageNames,
        organization.name
      );
    }

    return createdEvent;
  }

  /**
   * Edits an event (excluding schedule slots - use editScheduleSlot for that).
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
   * @param questionDocumentLink The link to the question document.
   * @param location Location of the event.
   * @param zoomLink Zoom Link if the event is online.
   * @param description Describes the event.
   * @param sendSlackNotifications Determines if this event should receive slack notifications.
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
    sendSlackNotifications: boolean,
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

    // NOTE: Use editScheduleSlot to modify individual schedule slots

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

    // throw if a user isn't found, then build prisma queries for connecting userIds
    const updatedRequiredMembers = getPrismaQueryUserIds(await getUsers(requiredMemberIds));
    const updatedOptionalMembers = getPrismaQueryUserIds(await getUsers(optionalMemberIds));

    // Update the event with new data (excluding schedule slots)
    const updatedEvent = await prisma.event.update({
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
        status,
        shops: {
          set: shopIds.map((shopId) => ({ shopId }))
        },
        machinery: {
          set: machineryIds.map((machineryId) => ({ machineryId }))
        },
        workPackages: {
          set: workPackageIds.map((workPackageId) => ({ workPackageId }))
        },
        location,
        zoomLink,
        questionDocumentLink,
        description,
        sendSlackNotifications
      },
      ...getEventQueryArgs(organization.organizationId)
    });

    //set any deleted documents with a dateDeleted
    await removeDeletedEventDocuments(documents, foundEvent.documents || [], submitter);

    const edittedEvent = eventTransformer(updatedEvent);

    if (status === Event_Status.SCHEDULED && sendSlackNotifications) {
      await sendEventScheduledSlackNotif(updatedEvent.notificationSlackThreads, edittedEvent);
    }

    if (status === Event_Status.CONFIRMED && sendSlackNotifications) {
      await sendEventConfirmationToThread(updatedEvent.notificationSlackThreads, updatedEvent.userCreated);
    }

    return edittedEvent;
  }

  /**
   * Previews which schedule slots would be affected when editing a slot with "edit all in series".
   * Returns only the OTHER slots that would be edited (excludes the current slot being edited).
   *
   * @param submitter The user submitting the request.
   * @param scheduleSlotId The id of the specific schedule slot being edited.
   * @param organization The organization context.
   *
   * @returns Array of schedule slots (excluding the current one) that have the same time-of-day pattern.
   *
   * @throws NotFoundException If the schedule slot or event is not found.
   * @throws AccessDeniedException If the user doesn't have permission.
   */
  static async previewScheduleSlotRecurringEdits(
    submitter: User,
    scheduleSlotId: string,
    organization: Organization
  ): Promise<ScheduleSlot[]> {
    // Validate schedule slot exists and get its eventId
    const scheduleSlot = await prisma.schedule_Slot.findUnique({
      where: { scheduleSlotId },
      select: {
        scheduleSlotId: true,
        eventId: true,
        startTime: true,
        endTime: true,
        allDay: true
      }
    });

    if (!scheduleSlot) throw new NotFoundException('Schedule Slot', scheduleSlotId);

    // Now fetch the event separately to check permissions
    const event = await prisma.event.findUnique({
      where: { eventId: scheduleSlot.eventId },
      select: {
        eventId: true,
        userCreatedId: true,
        location: true,
        dateDeleted: true
      }
    });

    if (!event) throw new NotFoundException('Event', scheduleSlot.eventId);
    if (event.dateDeleted) throw new DeletedException('Event', scheduleSlot.eventId);

    // Check permissions
    const hasPermission =
      (await userHasPermission(submitter.userId, organization.organizationId, isHead)) ||
      submitter.userId === event.userCreatedId;

    if (!hasPermission) {
      throw new AccessDeniedException(
        'Only admins, heads, or the event creator can see how editing this schedule slot will affect the event.'
      );
    }

    // Fetch all schedule slots for this event
    const allSlots = await prisma.schedule_Slot.findMany({
      where: { eventId: scheduleSlot.eventId },
      select: {
        scheduleSlotId: true,
        startTime: true,
        endTime: true,
        allDay: true
      }
    });

    // Find all slots with matching time-of-day pattern
    const matchingSlots = findMatchingTimeOfDaySlots(allSlots, scheduleSlotId);

    // Get today's date at midnight for comparison (day portion only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Exclude the current slot and any slots in the past (based on day only)
    const otherAffectedSlots = matchingSlots.filter((slot) => {
      if (slot.scheduleSlotId === scheduleSlotId) return false;

      const slotDate = new Date(slot.startTime);
      slotDate.setHours(0, 0, 0, 0);
      return slotDate >= today;
    });

    return otherAffectedSlots;
  }

  /**
   * Edits a specific schedule slot of an event.
   * Used when a user wants to change the time/date of a single occurrence in a recurring event.
   *
   * @param submitter The user submitting the request.
   * @param scheduleSlotId The id of the specific schedule slot to edit.
   * @param startTime The new start time.
   * @param endTime The new end time.
   * @param allDay Whether this is an all-day event.
   * @param editAllInSeries If true, edits all schedule slots with matching time-of-day.
   * @param organization The organization context.
   *
   * @returns The updated event.
   *
   * @throws NotFoundException If the event or schedule slot is not found.
   * @throws AccessDeniedException If the user doesn't have permission to edit.
   */
  static async editScheduleSlot(
    submitter: User,
    scheduleSlotId: string,
    startTime: Date,
    endTime: Date,
    allDay: boolean,
    editAllInSeries: boolean,
    organization: Organization
  ): Promise<Event> {
    // Validate schedule slot exists and get its eventId
    const scheduleSlot = await prisma.schedule_Slot.findUnique({
      where: { scheduleSlotId },
      select: {
        scheduleSlotId: true,
        eventId: true
      }
    });

    if (!scheduleSlot) throw new NotFoundException('Schedule Slot', scheduleSlotId);

    // Now fetch the event separately to check permissions
    const event = await prisma.event.findUnique({
      where: { eventId: scheduleSlot.eventId },
      select: {
        eventId: true,
        userCreatedId: true,
        location: true,
        dateDeleted: true,
        approved: true
      }
    });

    if (!event) throw new NotFoundException('Event', scheduleSlot.eventId);
    if (event.dateDeleted) throw new DeletedException('Event', scheduleSlot.eventId);

    // Check permissions
    const hasPermission =
      (await userHasPermission(submitter.userId, organization.organizationId, isHead)) ||
      submitter.userId === event.userCreatedId;

    if (!hasPermission) {
      throw new AccessDeniedException('Only admins, heads, or the event creator can edit the times of an event!');
    }

    // Check for conflicts with the new time
    const newSlotData: ScheduleSlotCreateArgs = {
      startTime,
      endTime,
      allDay
    };

    const { hasConflict, conflictingEvent } = await checkEventConflicts(
      [newSlotData],
      organization,
      event.location ?? undefined,
      event.eventId
    );

    // Determine which slots to update
    let slotsToUpdate: string[] = [scheduleSlotId];

    if (editAllInSeries) {
      // Fetch all schedule slots for this event
      const allSlots = await prisma.schedule_Slot.findMany({
        where: { eventId: scheduleSlot.eventId },
        select: {
          scheduleSlotId: true,
          startTime: true,
          endTime: true,
          allDay: true
        }
      });

      // Use helper function to find all slots with matching time-of-day
      const matchingSlots = findMatchingTimeOfDaySlots(allSlots, scheduleSlotId);
      slotsToUpdate = matchingSlots.map((slot) => slot.scheduleSlotId);
    }

    // Calculate the time offset from the original slot to the new time
    const originalSlot = await prisma.schedule_Slot.findUnique({
      where: { scheduleSlotId },
      select: { startTime: true, endTime: true }
    });

    if (!originalSlot || !originalSlot.startTime) {
      throw new NotFoundException('Schedule Slot', scheduleSlotId);
    }

    // Update all matching schedule slots
    for (const slotId of slotsToUpdate) {
      const currentSlot = await prisma.schedule_Slot.findUnique({
        where: { scheduleSlotId: slotId },
        select: { startTime: true, endTime: true }
      });

      if (!currentSlot || !currentSlot.startTime || !currentSlot.endTime) continue;

      // For the clicked slot, use the exact new times provided
      if (slotId === scheduleSlotId) {
        await prisma.schedule_Slot.update({
          where: { scheduleSlotId: slotId },
          data: {
            startTime,
            endTime,
            allDay
          }
        });
      } else {
        // For other slots in the series, preserve their date but update time-of-day
        const newSlotStart = new Date(currentSlot.startTime);
        newSlotStart.setHours(
          startTime.getHours(),
          startTime.getMinutes(),
          startTime.getSeconds(),
          startTime.getMilliseconds()
        );

        const newSlotEnd = new Date(currentSlot.endTime);
        newSlotEnd.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds(), endTime.getMilliseconds());

        await prisma.schedule_Slot.update({
          where: { scheduleSlotId: slotId },
          data: {
            startTime: newSlotStart,
            endTime: newSlotEnd,
            allDay
          }
        });
      }
    }

    // Update conflict status if needed
    if (hasConflict) {
      await prisma.event.update({
        where: { eventId: event.eventId },
        data: {
          approved: Conflict_Status.PENDING,
          approvalRequiredFromUserId: conflictingEvent?.userCreated.userId
        }
      });
    }

    // if event was changed to avoid conflict, update approved status
    if ((event.approved === Conflict_Status.PENDING || event.approved === Conflict_Status.DENIED) && !hasConflict) {
      await prisma.event.update({
        where: { eventId: event.eventId },
        data: {
          approved: Conflict_Status.NO_CONFLICT,
          approvalRequiredFromUserId: null
        }
      });
    }

    // Fetch and return the updated event
    const updatedEvent = await prisma.event.findUnique({
      where: { eventId: event.eventId },
      ...getEventQueryArgs(organization.organizationId)
    });

    if (!updatedEvent) throw new NotFoundException('Event', event.eventId);

    return eventTransformer(updatedEvent);
  }

  /**
   * Deletes a specific schedule slot from an event.
   * If this is the last schedule slot, the entire event is deleted instead.
   *
   * @param submitter The user submitting the request.
   * @param scheduleSlotId The id of the specific schedule slot to delete.
   * @param organization The organization context.
   *
   * @returns The updated event (or the deleted event if it was the last slot).
   *
   * @throws NotFoundException If the event or schedule slot is not found.
   * @throws DeletedException If the event has already been deleted.
   * @throws AccessDeniedException If the user doesn't have permission to delete.
   */
  static async deleteScheduleSlot(submitter: User, scheduleSlotId: string, organization: Organization): Promise<Event> {
    // Validate schedule slot exists and get its eventId
    const scheduleSlot = await prisma.schedule_Slot.findUnique({
      where: { scheduleSlotId },
      select: {
        scheduleSlotId: true,
        eventId: true
      }
    });

    if (!scheduleSlot) throw new NotFoundException('Schedule Slot', scheduleSlotId);

    // Fetch the event to check permissions and slot count
    const event = await prisma.event.findUnique({
      where: { eventId: scheduleSlot.eventId },
      include: {
        scheduledTimes: true
      }
    });

    if (!event) throw new NotFoundException('Event', scheduleSlot.eventId);
    if (event.dateDeleted) throw new DeletedException('Event', scheduleSlot.eventId);

    // Check permissions - same as deleteEvent
    const hasPermission =
      (await userHasPermission(submitter.userId, organization.organizationId, isAdmin)) ||
      submitter.userId === event.userCreatedId;

    if (!hasPermission) {
      throw new AccessDeniedException('Only admins or the event creator can delete schedule slots!');
    }

    // If this is the last schedule slot, delete the entire event instead
    if (event.scheduledTimes.length <= 1) {
      return this.deleteEvent(submitter, event.eventId, organization);
    }

    // Delete the schedule slot (hard delete for schedule slots)
    await prisma.schedule_Slot.delete({
      where: { scheduleSlotId }
    });

    // Fetch and return the updated event
    const updatedEvent = await prisma.event.findUnique({
      where: { eventId: event.eventId },
      ...getEventQueryArgs(organization.organizationId)
    });

    if (!updatedEvent) throw new NotFoundException('Event', event.eventId);

    return eventTransformer(updatedEvent);
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
   * @param organization The organization for which the event is being approved.
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
      throw new AccessDeniedException('Only admins or heads or the owner of the conflicting event can approve this event!');
    }

    const approvedEvent = await prisma.event.update({
      where: { eventId },
      data: {
        approved: Conflict_Status.APPROVED,
        approvalRequiredFromUserId: submitter.userId
      },
      ...getEventQueryArgs(organization.organizationId)
    });

    return eventTransformer(approvedEvent);
  }

  /**
   * Denies an event in the database
   * @param submitter The user submitting the request who must be a head or above.
   * @param eventId The id of the given event.
   * @param organization The organization for which the event is being denied.
   *
   * @returns The denied event.
   *
   * @throws NotFoundException If the given eventId is not found.
   * @throws InvalidOrganizationException If the given eventId is not part of the same organization.
   * @throws DeletedException If the event has already been deleted.
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin or head.
   */
  static async denyEvent(submitter: User, eventId: string, organization: Organization): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { eventId }
    });

    if (!event) throw new NotFoundException('Event', eventId);
    if (event.dateDeleted) throw new DeletedException('Event', eventId);

    const hasPermission =
      (await userHasPermission(submitter.userId, organization.organizationId, isHead)) ||
      event.approvalRequiredFromUserId === submitter.userId;

    if (!hasPermission) {
      throw new AccessDeniedException('Only admins or heads or the owner of the conflicting event can deny this event!');
    }

    const deniedEvent = await prisma.event.update({
      where: { eventId },
      data: {
        approved: Conflict_Status.DENIED,
        approvalRequiredFromUserId: submitter.userId
      },
      ...getEventQueryArgs(organization.organizationId)
    });

    return eventTransformer(deniedEvent);
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
      ...getEventWithMembersQueryArgs(organization.organizationId)
    });

    if (!event) throw new NotFoundException('Event', eventId);
    if (event.dateDeleted) throw new DeletedException('Event', eventId);

    if (!isUserOnEvent(submitter, eventWithMembersTransformer(event)))
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
    if (!event.confirmedMembers.map((user: { userId: string }) => user.userId).includes(submitter.userId)) {
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

      if (updatedEvent.sendSlackNotifications) {
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
        if (updatedEvent.sendSlackNotifications) {
          await sendEventConfirmationToThread(updatedEvent.notificationSlackThreads, updatedEvent.userCreated);
        }
      }

      return eventTransformer(updatedEvent);
    }
    return eventTransformer(event);
  }

  /**
   * Schedules an event by adding a schedule slot and changing the status to SCHEDULED.
   * Only the event creator can schedule the event.
   *
   * @param submitter The user submitting the request.
   * @param eventId The id of the event to schedule.
   * @param startTime The start time of the scheduled slot.
   * @param endTime The end time of the scheduled slot.
   * @param organization The organization context.
   *
   * @returns The updated event with the new schedule slot.
   *
   * @throws NotFoundException If the event is not found.
   * @throws DeletedException If the event has been deleted.
   * @throws AccessDeniedException If the user is not the event creator or an admin.
   * @throws HttpException If the event is not in CONFIRMED status.
   */
  static async scheduleEvent(
    submitter: User,
    eventId: string,
    startTime: Date,
    endTime: Date,
    organization: Organization
  ): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { eventId },
      ...getEventQueryArgs(organization.organizationId)
    });

    if (!event) throw new NotFoundException('Event', eventId);
    if (event.dateDeleted) throw new DeletedException('Event', eventId);

    // Cannot schedule an already scheduled event
    if (event.status === Event_Status.SCHEDULED) {
      throw new HttpException(400, 'Event is already scheduled');
    }

    // Only the event creator can schedule the event
    if (
      submitter.userId !== event.userCreatedId &&
      !(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))
    ) {
      throw new AccessDeniedException('Only the event creator and admins can schedule the event');
    }

    // Check for conflicts with the new time
    const newSlotData: ScheduleSlotCreateArgs = {
      startTime,
      endTime,
      allDay: false
    };

    const { hasConflict, conflictingEvent } = await checkEventConflicts(
      [newSlotData],
      organization,
      event.location ?? undefined,
      event.eventId
    );

    // Update the event with a new schedule slot and change status to SCHEDULED
    const updatedEvent = await prisma.event.update({
      where: { eventId },
      data: {
        status: Event_Status.SCHEDULED,
        scheduledTimes: {
          create: {
            startTime,
            endTime,
            allDay: false
          }
        },
        approved: hasConflict ? Conflict_Status.PENDING : event.approved,
        approvalRequiredFromUserId: hasConflict ? conflictingEvent?.userCreated.userId : event.approvalRequiredFromUserId
      },
      ...getEventQueryArgs(organization.organizationId)
    });

    // Remove the scheduled time from confirmed members' availabilities so they can't be
    // double-booked for other events that require confirmation during the same time slot
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    for (const member of event.confirmedMembers) {
      if (!member.drScheduleSettings) continue;
      const existingAvailability = member.drScheduleSettings.availabilities.find((a) => isSameDay(a.dateSet, startTime));
      if (!existingAvailability) continue;
      // Availability index i represents local hour (10 + i); remove indices that fall within [startHour, endHour)
      const updatedAvailability = existingAvailability.availability.filter(
        (i) => !(10 + i >= startHour && 10 + i < endHour)
      );
      await prisma.availability.update({
        where: { availabilityId: existingAvailability.availabilityId },
        data: { availability: updatedAvailability }
      });
    }

    const { eventTypeId } = updatedEvent;
    const foundEventType = await prisma.event_Type.findUnique({
      where: { eventTypeId }
    });

    if (updatedEvent.sendSlackNotifications) {
      await sendEventScheduledSlackNotif(updatedEvent.notificationSlackThreads, eventTransformer(updatedEvent));
    }

    return eventTransformer(updatedEvent);
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

    // Delete from Google Calendar
    if (event.calendarEventIds && event.calendarEventIds.length > 0 && process.env.NODE_ENV === 'production') {
      try {
        await deleteCalendarEvents(process.env.GOOGLE_CALENDAR_ID!, event.calendarEventIds);
      } catch (error) {
        console.error('Failed to delete Google Calendar events:', error);
      }
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
    requiresConfirmation: boolean
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
        requiresConfirmation
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
    const { memberIds, teamIds, calendarIds, eventTypeIds, eventIds, approvalIds, startPeriod, endPeriod, statuses } =
      filters;

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

    // filters for members/teams - event must match at least one of these if provided
    const memberOrTeamFilter: any[] = [];

    if (memberIds?.length) {
      memberOrTeamFilter.push(
        { requiredMembers: { some: { userId: { in: memberIds } } } },
        { optionalMembers: { some: { userId: { in: memberIds } } } },
        { userCreatedId: { in: memberIds } }
      );
    }

    if (teamIds?.length) {
      memberOrTeamFilter.push({ teams: { some: { teamId: { in: teamIds } } } });
      memberOrTeamFilter.push({ workPackages: { some: { project: { teams: { some: { teamId: { in: teamIds } } } } } } });
    }

    // filters for timing, based on either schedule slots (confirmed events) or initial date scheduled (unconfirmed events)
    const scheduleSlotsOrDateScheduled: any[] = [
      {
        scheduledTimes: buildScheduledTimesOverlap(startPeriod, endPeriod)
      },
      {
        AND: [{ initialDateScheduled: { gte: startPeriod } }, { initialDateScheduled: { lte: endPeriod } }]
      }
    ];

    // filters for selected calendars
    const fromCalendar =
      calendarIds !== undefined
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

    // Build the AND conditions - member/team filters AND time filters
    const andConditions: any[] = [];

    // If member/team filters are provided, require at least one to match
    if (memberOrTeamFilter.length > 0) {
      andConditions.push({ OR: memberOrTeamFilter });
    }

    // If time filters are provided, require at least one to match
    if (startPeriod || endPeriod) {
      andConditions.push({ OR: scheduleSlotsOrDateScheduled });
    }

    // get event using filter args
    const events = await prisma.event.findMany({
      where: {
        dateDeleted: null,
        eventId: eventIds?.length ? { in: eventIds } : undefined,
        eventTypeId: eventTypeIds?.length ? { in: eventTypeIds } : undefined,
        approvalRequiredFromUserId: approvalIds?.length ? { in: approvalIds } : undefined,
        approved: statuses?.length ? { in: statuses } : undefined,
        AND: andConditions.length > 0 ? andConditions : undefined,
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
   * @param eventId the id of the event to retrieve
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
   * Retrieves a single event
   *
   * @param submitter the user who is trying to retrieve the event
   * @param eventId the id of the event to retrieve
   * @param organizationId the organization that the user is currently in
   * @returns the event
   */
  static async getSingleEventWithMembers(_submitter: User, eventId: string, organization: Organization): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { eventId },
      ...getEventWithMembersQueryArgs(organization.organizationId)
    });

    if (!event) throw new NotFoundException('Event', eventId);

    if (event.dateDeleted) throw new DeletedException('Event', eventId);

    return eventTransformer(event);
  }

  /**
   * Retrieves a potential conflicting event
   * If no conflict exists, returns the original event
   *
   * @param submitter the user who is trying to retrieve the event
   * @param eventId the id of the event to retrieve
   * @param organizationId the organization that the user is currently in
   * @returns the event
   */
  static async getConflictingEvent(_submitter: User, eventId: string, organization: Organization): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { eventId },
      ...getEventQueryArgs(organization.organizationId)
    });

    if (!event) throw new NotFoundException('Event', eventId);

    if (event.dateDeleted) throw new DeletedException('Event', eventId);

    const eventType = await prisma.event_Type.findUnique({
      where: { eventTypeId: event.eventTypeId }
    });

    if (!eventType) throw new NotFoundException('Event Type', event.eventTypeId);

    if (eventType.dateDeleted) throw new DeletedException('Event Type', event.eventTypeId);

    if (eventType.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Calendar');
    }

    const transformedEvent = eventTransformer(event);

    const { hasConflict, conflictingEvent } = await checkEventConflicts(
      transformedEvent.scheduledTimes,
      organization,
      transformedEvent.location,
      transformedEvent.eventId
    );

    if (hasConflict && conflictingEvent) {
      return conflictingEvent;
    }

    return transformedEvent;
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
