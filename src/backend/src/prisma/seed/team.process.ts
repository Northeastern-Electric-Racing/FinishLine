import { Team, Team_Type } from '@prisma/client';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { seedTeamConfigs, teamCreateInput } from '../factories/teams.factory.js';
import { SeedProcess } from '../processes/seed-process.js';

type TeamInput = OrganizationOutput & UsersOutput & ConfigDataOutput;

export type TeamOutput = {
  teams: Team[];
  financeTeam: Team;
  teamsByName: Record<string, Team>;
};

export class TeamProcess extends SeedProcess<TeamInput, TeamOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess];
  }

  async run({ organization, admins, heads, leadership, members, teamTypes }: TeamInput): Promise<TeamOutput> {
    if (seedTeamConfigs.length !== 20) {
      throw new Error(`TeamProcess expected 20 teams but found ${seedTeamConfigs.length}.`);
    }

    if (admins.length === 0 || heads.length === 0 || leadership.length === 0 || members.length === 0) {
      throw new Error('TeamProcess requires admins, heads, leadership, and members to create teams.');
    }

    const teamNames = seedTeamConfigs.map((team) => team.teamName);

    if (new Set(teamNames).size !== teamNames.length) {
      throw new Error('TeamProcess cannot generate duplicate team names.');
    }

    const teamTypesByName = teamTypes.reduce<Record<string, Team_Type>>((acc, teamType) => {
      acc[teamType.name] = teamType;
      return acc;
    }, {});

    const possibleHeads = [...heads, ...admins, ...leadership];
    const possibleLeads = [...leadership, ...heads, ...admins];

    const teams = await Promise.all(
      seedTeamConfigs.map((config, index) => {
        const head = possibleHeads[index % possibleHeads.length];

        if (!head) {
          throw new Error('TeamProcess could not find a head for a team.');
        }

        const leadPool = possibleLeads.filter((user) => user.userId !== head.userId);
        const leads = this.faker.helpers.arrayElements(leadPool, this.faker.number.int({ min: 1, max: 3 }));
        const teamMembers = this.faker.helpers.arrayElements(members, this.faker.number.int({ min: 8, max: 20 }));

        return this.prisma.team.create({
          data: teamCreateInput(this.faker, organization.organizationId, head, leads, teamMembers, teamTypesByName, config)
        });
      })
    );

    const teamsByName = teams.reduce<Record<string, Team>>((acc, team) => {
      acc[team.teamName] = team;
      return acc;
    }, {});

    const financeTeam = teamsByName.Finance;

    if (!financeTeam) {
      throw new Error('TeamProcess expected a Finance team to be generated.');
    }

    return { teams, financeTeam, teamsByName };
  }
}
