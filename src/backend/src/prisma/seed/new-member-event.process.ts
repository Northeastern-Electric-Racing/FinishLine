import { Conflict_Status, Event_Status } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import {
  eventCreateInput,
  generateEventDateCreated,
  generateLocation,
  generateNewMemberEventDate,
  generateNewMemberSignUps,
  generateScheduleSlotTimes,
  NEW_MEMBER_EVENT_TITLES,
  NEW_MEMBER_EVENT_TYPE_NAME,
  NEW_MEMBER_TERMS_SEEDED,
  scheduleSlotCreateInput
} from '../factories/event.factory.js';

type NewMemberEventInput = OrganizationOutput & UsersOutput & ConfigDataOutput;

/**
 * Seeds events on the new member calendar with sign-up counts across the most recent terms,
 * which feeds the executive summary's "New Member Sign-Ups Across Events" chart.
 */
export class NewMemberEventProcess extends SeedProcess<NewMemberEventInput, Record<string, never>> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess];
  }

  async run({ leadership, heads, admins, eventTypes }: NewMemberEventInput): Promise<Record<string, never>> {
    const eventType = eventTypes.find((type) => type.name === NEW_MEMBER_EVENT_TYPE_NAME);
    if (!eventType) throw new Error(`NewMemberEventProcess requires the "${NEW_MEMBER_EVENT_TYPE_NAME}" event type.`);
    const creators = [...leadership, ...heads, ...admins];

    // Walk backwards from the current term: spring of this year (or fall of last year) and so on.
    const year = this.now.getFullYear();
    const terms: { year: number; isFall: boolean }[] = [];
    let termYear = this.now.getMonth() >= 7 ? year : year - 1;
    let isFall = this.now.getMonth() >= 7;
    for (let i = 0; i < NEW_MEMBER_TERMS_SEEDED; i++) {
      terms.push({ year: isFall ? termYear : termYear + 1, isFall });
      if (!isFall) termYear -= 1;
      isFall = !isFall;
    }

    for (const term of terms) {
      const titles = this.faker.helpers.arrayElements(NEW_MEMBER_EVENT_TITLES, this.faker.number.int({ min: 2, max: 4 }));
      for (const title of titles) {
        const date = generateNewMemberEventDate(this.faker, term.year, term.isFall);
        // never seed future events with sign-ups already recorded
        if (date > this.now) continue;
        const creator = this.faker.helpers.arrayElement(creators);
        const { startTime, endTime } = generateScheduleSlotTimes(this.faker, date);

        const event = await this.prisma.event.create({
          data: eventCreateInput(
            eventType,
            `${title} ${term.isFall ? 'Fall' : 'Spring'} ${term.year}`,
            creator.userId,
            eventType.eventTypeId,
            Event_Status.DONE,
            Conflict_Status.NO_CONFLICT,
            date,
            generateLocation(this.faker),
            null,
            null,
            null,
            [creator.userId],
            [],
            [],
            [],
            generateEventDateCreated(this.faker, date),
            undefined,
            generateNewMemberSignUps(this.faker)
          )
        });
        await this.prisma.schedule_Slot.create({ data: scheduleSlotCreateInput(event.eventId, startTime, endTime) });
      }
    }

    return {};
  }
}
