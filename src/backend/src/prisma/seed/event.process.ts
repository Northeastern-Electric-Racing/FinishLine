import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import { TeamJoinRequestProcess } from './team-join-request.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { CarOutput } from '../context.js';
import { CarProcess } from './car.process.js';
import {
  DAYS_AFTER_NO_EVENT,
  documentCreateInput,
  eventCreateInput,
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
    return [
      OrganizationProcess,
      UsersProcess,
      ConfigDataProcess,
      TeamProcess,
      // Ensures guest -> member promotions from approved join requests have landed before this
      // process picks event attendees from the `members` pool.
      TeamJoinRequestProcess,
      CarProcess,
      ProjectProcess
    ];
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

    // Preload each team's roster (members + leads + head) once so meeting-attendance seeding can
    // draw attendees from the real roster without an extra query per meeting.
    const teamRosters = await this.prisma.team.findMany({
      where: { teamId: { in: teams.map((team) => team.teamId) } },
      select: { teamId: true, headId: true, members: { select: { userId: true } }, leads: { select: { userId: true } } }
    });
    const rosterIdsByTeamId = new Map<string, string[]>(
      teamRosters.map((team) => [
        team.teamId,
        [team.headId, ...team.members.map((m) => m.userId), ...team.leads.map((l) => l.userId)]
      ])
    );

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
            rosterIdsByTeamId,
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
    rosterIdsByTeamId: Map<string, string[]>,
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
        ? [
            creator.userId,
            ...this.faker.helpers
              .arrayElements(allUsers, this.faker.number.int({ min: 0, max: 4 }))
              .map((user) => user.userId)
          ]
        : [creator.userId];
      const optionalMemberIds = eventType.optionalMembers
        ? this.faker.helpers
            .arrayElements(
              allUsers.filter((user) => !requiredMemberIds.includes(user.userId)),
              this.faker.number.int({ min: 0, max: 5 })
            )
            .map((user) => user.userId)
        : [];

      const confirmedMemberIds = eventType.requiresConfirmation
        ? status === Event_Status.CONFIRMED
          ? [...requiredMemberIds, ...this.faker.helpers.arrayElements(optionalMemberIds)]
          : [...this.faker.helpers.arrayElements(requiredMemberIds), ...this.faker.helpers.arrayElements(optionalMemberIds)]
        : [];

      // Unused. For reference if later reused.
      const deniedMemberIds: string[] = [];

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
          dateCreated,
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

        // Draw attendees from the team's own roster (members + leads + head) so the
        // attendance-percentage statistics graphs report meaningful values.
        const rosterIds = rosterIdsByTeamId.get(team.teamId) ?? [];

        if (rosterIds.length > 0) {
          const attendeeCount = Math.max(1, Math.round(rosterIds.length * this.faker.number.float({ min: 0.4, max: 1 })));
          const attendees = this.faker.helpers.arrayElements(rosterIds, Math.min(attendeeCount, rosterIds.length));

          await this.prisma.meeting_Attendance.create({
            data: meetingAttendanceCreateInput(
              this.faker,
              organizationId,
              team.teamId,
              creator.userId,
              attendees,
              initialDateScheduled
            )
          });
        }
      }
    }
  }
}
