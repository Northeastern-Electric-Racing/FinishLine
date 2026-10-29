import { Bay_Dashboard_Countdown } from '@prisma/client';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { bayDashboardCountdownCreateInput, countdownConfigs } from '../factories/bay-dashboard.factory.js';
import { SeedProcess } from '../processes/seed-process.js';

type BayDashboardInput = OrganizationOutput & UsersOutput;

export type BayDashboardOutput = {
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

    const countdowns = await Promise.all(
      countdownConfigs.map((config) =>
        this.prisma.bay_Dashboard_Countdown.create({
          data: bayDashboardCountdownCreateInput(creator.userId, organizationId, config, now)
        })
      )
    );

    return { countdowns };
  }
}
