import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { CarOutput } from '../context.js';
import { CarProcess } from './car.process.js';
import {
  documentCreateInput,
  eventCreateInput,
  generateApprovalRequiredFromUserId,
  generateAttendeeCount,
  generateConflictStatus,
  generateEventCount,
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
import { clampDate, daysBetween, subtractDaysFromDate } from '../dates.js';

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
        batch.map(({ project, timeline }) =>
          this.generateEventsForProject(
            organizationId,
            project.wbsElement.name,
            timeline,
            creators,
            allUsers,
            teams,
            eventTypes,
            now
          )
        )
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
    const count = generateEventCount(this.faker);
    // Increase the window with about 50 days of padding to account for car switching
    const window = { start: subtractDaysFromDate(timeline.start, 50), end: addDaysToDate(timeline.end, 50) };

    for (let i = 0; i < count; i++) {
      const creator = this.faker.helpers.arrayElement(creators);
      const eventType = this.faker.helpers.arrayElement(eventTypes);
      const approved = generateConflictStatus(this.faker);
      const title = generateEventTitle(this.faker, projectName);

      const availableDays = daysBetween(window);
      const offsetDays = generateInitialDateOffset(this.faker, availableDays, window.end > now);
      const initialDateScheduled = addDaysToDate(window.start, offsetDays);
      const status = generateEventStatus(this.faker, initialDateScheduled);

      const location = generateLocation(this.faker);
      const zoomLink = generateZoomLink(this.faker);
      const description = generateEventDescription(this.faker);
      const questionDocumentLink = generateQuestionDocumentLink(this.faker);
      const approvalRequiredFromUserId = generateApprovalRequiredFromUserId(this.faker, creators);

      const event = await this.prisma.event.create({
        data: eventCreateInput(
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
          approvalRequiredFromUserId
        )
      });

      const slotCount = generateScheduleSlotCount(this.faker, title);
      for (let s = 0; s < slotCount; s++) {
        const slotDate = addDaysToDate(initialDateScheduled, s * 7);
        const { startTime, endTime } = generateScheduleSlotTimes(this.faker, clampDate(slotDate, window));
        await this.prisma.schedule_Slot.create({
          data: scheduleSlotCreateInput(event.eventId, startTime, endTime)
        });
      }

      if (shouldCreateDocument(this.faker)) {
        await this.prisma.document.create({
          data: documentCreateInput(this.faker, event.eventId, creator.userId)
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
