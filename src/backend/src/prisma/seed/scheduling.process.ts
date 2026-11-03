import { Availability, Schedule_Settings } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput } from './config-data.process.js';
import { TeamJoinRequestProcess } from './team-join-request.process.js';
import { availabilityCreateInput, scheduleSettingsCreateInput } from '../factories/scheduling.factory.js';

type SchedulingInput = OrganizationOutput & UsersOutput & ConfigDataOutput;

const getSeedStartDate = (now: Date): Date => {
  const start = new Date(now);
  start.setDate(start.getDate() - start.getDay()); // rewind to Sunday
  start.setHours(0, 0, 0, 0);
  return start;
};

export type SchedulingOutput = {
  scheduleSettings: Schedule_Settings[];
  availabilities: Availability[];
};

export class SchedulingProcess extends SeedProcess<SchedulingInput, SchedulingOutput> {
  dependencies() {
    return [
      OrganizationProcess,
      UsersProcess,
      // Ensures guest -> member promotions from approved join requests have landed before this
      // process builds its eligible-user pool from `members`.
      TeamJoinRequestProcess
    ];
  }

  async run({ members, appAdmins, admins, heads, leadership }: SchedulingInput): Promise<SchedulingOutput> {
    const eligibleUsers = [...appAdmins, ...admins, ...heads, ...leadership, ...members];
    const seedStartDate = getSeedStartDate(this.now);

    const scheduleSettings = await Promise.all(
      eligibleUsers.map((user) =>
        this.prisma.schedule_Settings.create({
          data: scheduleSettingsCreateInput(this.faker, user.userId)
        })
      )
    );

    const availabilities = await Promise.all(
      scheduleSettings.flatMap((settings) =>
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date(seedStartDate);
          date.setDate(date.getDate() + i);
          return this.prisma.availability.create({
            data: availabilityCreateInput(this.faker, settings.drScheduleSettingsId, date)
          });
        })
      )
    );

    return { scheduleSettings, availabilities };
  }
}
