import { Bay_Dashboard_Config, Bay_Dashboard_Countdown } from '@prisma/client';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import {
  bayDashboardConfigCreateInput,
  bayDashboardCountdownCreateInput,
  countdownConfigs,
  previousSlotConfigs,
  slotConfigs
} from '../factories/bay-dashboard.factory.js';
import { subtractDaysFromDate } from '../dates.js';
import { SeedProcess } from '../processes/seed-process.js';

type BayDashboardInput = OrganizationOutput & UsersOutput;

export type BayDashboardOutput = {
  config: Bay_Dashboard_Config;
  countdowns: Bay_Dashboard_Countdown[];
};

export class BayDashboardProcess extends SeedProcess<BayDashboardInput, BayDashboardOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess];
  }

  async run({ organization, appAdmins }: BayDashboardInput): Promise<BayDashboardOutput> {
    const { organizationId } = organization;
    const [creator] = appAdmins;

    if (!creator) throw new Error('BayDashboardProcess requires at least one app admin user.');

    const now = new Date();

    // saving a config soft deletes the previous one
    await this.prisma.bay_Dashboard_Config.create({
      data: bayDashboardConfigCreateInput(
        creator.userId,
        organizationId,
        previousSlotConfigs,
        subtractDaysFromDate(now, 30),
        now
      )
    });

    const config = await this.prisma.bay_Dashboard_Config.create({
      data: bayDashboardConfigCreateInput(creator.userId, organizationId, slotConfigs)
    });

    const countdowns = await Promise.all(
      countdownConfigs.map((config) =>
        this.prisma.bay_Dashboard_Countdown.create({
          data: bayDashboardCountdownCreateInput(creator.userId, organizationId, config, now)
        })
      )
    );

    return { config, countdowns };
  }
}
