import { Availability, Schedule_Settings } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { availabilityCreateInput, scheduleSettingsCreateInput } from '../factories/scheduling.factory.js';

type SchedulingInput = OrganizationOutput & UsersOutput & ConfigDataOutput;

export type SchedulingOutput = {
  scheduleSettings: Schedule_Settings[];
  availabilities: Availability[];
};

export class SchedulingProcess extends SeedProcess<SchedulingInput, SchedulingOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess];
  }

  async run({ appAdmins, admins, heads, leadership }: SchedulingInput): Promise<SchedulingOutput> {
    const eligibleUsers = [...appAdmins, ...admins, ...heads, ...leadership];

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
          const date = new Date();
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
