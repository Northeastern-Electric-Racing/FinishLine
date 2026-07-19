import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { CarOutput } from '../context.js';
import { CarProcess } from './car.process.js';
import {
  DAYS_AFTER_NO_EVENT,
  documentCreateInput,
  eventCreateInput,
  generateAttendeeCount,
  generateConflictStatus,
  generateEventCount,
  generateEventDateCreated,
  generateEventDescription,
  generateEventStatus,
  generateEventTitle,
  generateInitialDateOffset,
  generateLocation,
  generateQuestionDocumentLink,
  generateScheduleSlotCount,
  generateScheduleSlotTimes,
  generateZoomLink,
  meetingAttendanceCreateInput,
  scheduleSlotCreateInput,
  shouldCreateDocument,
  shouldCreateMeetingAttendance
} from '../factories/event.factory.js';
import { addDaysToDate } from 'shared';
import { clampDate, DAY_MS, daysBetween } from '../dates.js';
import { Event_Status } from '@prisma/client';

type EventInput = OrganizationOutput & UsersOutput & ConfigDataOutput & TeamOutput & CarOutput & ProjectOutput;

export class EventProcess extends SeedProcess<EventInput, Record<string, never>> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess, TeamProcess, CarProcess, ProjectProcess];
  }

  async run({
    organization,
    projects,
    leadership,
    heads,
    admins,
    appAdmins,
    members,
    teams,
    eventTypes
  }: EventInput): Promise<Record<string, never>> {
    const { organizationId } = organization;
    const creators = [...leadership, ...heads, ...admins, ...appAdmins];
    const allUsers = [...members, ...leadership, ...heads, ...admins, ...appAdmins];

    const now = new Date();

    const BATCH_SIZE = 20;
    for (let i = 0; i < projects.length; i += BATCH_SIZE) {
      const batch = projects.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(({ project, timeline }) => {
          return this.generateEventsForProject(
            organizationId,
            project.wbsElement.name,
            timeline,
            creators,
            allUsers,
            teams,
            eventTypes,
            now
          );
        })
      );
    }

    return {};
  }

  private async generateEventsForProject(
    organizationId: string,
    projectName: string,
    timeline: { start: Date; end: Date },
    creators: UsersOutput['leadership'],
    allUsers: UsersOutput['members'],
    teams: TeamOutput['teams'],
    eventTypes: ConfigDataOutput['eventTypes'],
    now: Date
  ) {
    if ((timeline.start.getTime() - now.getTime()) / DAY_MS > DAYS_AFTER_NO_EVENT) return;

    const count = generateEventCount(this.faker);
    // Increase the window with about 50 days of padding to account for car switching

    for (let i = 0; i < count; i++) {
      const creator = this.faker.helpers.arrayElement(creators);
      const eventType = this.faker.helpers.arrayElement(eventTypes);
      const { approved, approvalRequiredFromUserId } = generateConflictStatus(this.faker, creators);
      const title = generateEventTitle(this.faker, projectName);

      const availableDays = daysBetween(timeline);
      const offsetDays = generateInitialDateOffset(this.faker, availableDays, timeline.end > now);
      const initialDateScheduled = addDaysToDate(timeline.start, offsetDays);
      const status = generateEventStatus(this.faker, eventType.requiresConfirmation, initialDateScheduled);

      const location = generateLocation(this.faker);
      const zoomLink = generateZoomLink(this.faker);
      const description = generateEventDescription(this.faker);
      const questionDocumentLink = generateQuestionDocumentLink(this.faker);
      const dateCreated = generateEventDateCreated(this.faker, initialDateScheduled);

      const requiredMemberIds = eventType.requiredMembers
        ? this.faker.helpers.arrayElements(allUsers, this.faker.number.int({ min: 1, max: 5 })).map((user) => user.userId)
        : [];
      const optionalMemberIds = eventType.optionalMembers
        ? this.faker.helpers
            .arrayElements(
              allUsers.filter((user) => !requiredMemberIds.includes(user.userId)),
              this.faker.number.int({ min: 1, max: 5 })
            )
            .map((user) => user.userId)
        : [];

      const allMemberIds = [...requiredMemberIds, ...optionalMemberIds];

      const confirmedMemberIds = eventType.requiresConfirmation
        ? status === Event_Status.CONFIRMED
          ? [...requiredMemberIds, ...this.faker.helpers.arrayElements(optionalMemberIds)]
          : [...this.faker.helpers.arrayElements(requiredMemberIds), ...this.faker.helpers.arrayElements(optionalMemberIds)]
        : [];
      const deniedMemberIds = eventType.requiresConfirmation
        ? [...this.faker.helpers.arrayElements(allMemberIds.filter((id) => !confirmedMemberIds.includes(id)))]
        : [];

      const event = await this.prisma.event.create({
        data: eventCreateInput(
          eventType,
          title,
          creator.userId,
          eventType.eventTypeId,
          status,
          approved,
          initialDateScheduled,
          location,
          zoomLink,
          description,
          questionDocumentLink,
          requiredMemberIds,
          optionalMemberIds,
          confirmedMemberIds,
          deniedMemberIds,
          approvalRequiredFromUserId
        )
      });

      const slotCount = generateScheduleSlotCount(this.faker, title);
      const daysRemaining = daysBetween({ start: initialDateScheduled, end: timeline.end });
      const maxSlots = Math.max(1, Math.floor(daysRemaining / 7));
      const actualSlotCount = Math.min(slotCount, maxSlots);

      for (let s = 0; s < actualSlotCount; s++) {
        const slotDate = addDaysToDate(initialDateScheduled, s * 7);
        const { startTime, endTime } = generateScheduleSlotTimes(this.faker, clampDate(slotDate, timeline));
        await this.prisma.schedule_Slot.create({
          data: scheduleSlotCreateInput(event.eventId, startTime, endTime)
        });
      }

      if (shouldCreateDocument(this.faker)) {
        await this.prisma.document.create({
          data: documentCreateInput(this.faker, event.eventId, creator.userId, dateCreated)
        });
      }

      if (shouldCreateMeetingAttendance(this.faker)) {
        const team = this.faker.helpers.arrayElement(teams);
        const attendeeCount = generateAttendeeCount(this.faker, allUsers.length);
        const attendees = this.faker.helpers.arrayElements(allUsers, attendeeCount);

        await this.prisma.meeting_Attendance.create({
          data: meetingAttendanceCreateInput(
            this.faker,
            organizationId,
            team.teamId,
            creator.userId,
            attendees.map((u) => u.userId),
            initialDateScheduled
          )
        });
      }
    }
  }
}
