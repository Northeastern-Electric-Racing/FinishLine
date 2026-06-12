import { Team, Team_Type } from '@prisma/client';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { seedTeamConfigs, teamCreateInput } from '../factories/teams.factory.js';
import { SeedProcess } from '../processes/seed-process.js';
import type { FullUser } from '../context.js';

const MIN_LEADS_PER_TEAM = 1;
const MAX_LEADS_PER_TEAM = 3;
const MIN_MEMBERS_PER_TEAM = 8;
const MAX_MEMBERS_PER_TEAM = 20;

type TeamInput = OrganizationOutput & UsersOutput & ConfigDataOutput;

export type TeamOutput = {
  teams: Team[];
  financeTeam: Team;
  teamsByName: Record<string, Team>;
};

const uniqueUsersById = (users: FullUser[]): FullUser[] => {
  return Array.from(new Map(users.map((user) => [user.userId, user])).values());
};

export class TeamProcess extends SeedProcess<TeamInput, TeamOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess];
  }

  async run({ organization, admins, heads, leadership, members, teamTypes }: TeamInput): Promise<TeamOutput> {
    if (admins.length === 0 || heads.length === 0 || leadership.length === 0 || members.length === 0) {
      throw new Error('TeamProcess requires admins, heads, leadership, and members to create teams.');
    }

    if (members.length < MIN_MEMBERS_PER_TEAM) {
      throw new Error(
        `TeamProcess requires at least ${MIN_MEMBERS_PER_TEAM} member candidates, but only found ${members.length}.`
      );
    }

    const teamNames = seedTeamConfigs.map((team) => team.teamName);

    if (new Set(teamNames).size !== teamNames.length) {
      throw new Error('TeamProcess cannot generate duplicate team names.');
    }

    const teamTypesByName = teamTypes.reduce<Record<string, Team_Type>>((acc, teamType) => {
      acc[teamType.name] = teamType;
      return acc;
    }, {});

    const teamLeadershipCandidates = uniqueUsersById([...heads, ...admins, ...leadership]);

    if (teamLeadershipCandidates.length < seedTeamConfigs.length) {
      throw new Error(
        `Not enough head candidates (${teamLeadershipCandidates.length}) for ${seedTeamConfigs.length} teams.`
      );
    }

    const headCandidates = teamLeadershipCandidates.slice(0, seedTeamConfigs.length);
    const headIds = new Set(headCandidates.map((head) => head.userId));

    const leadCandidates = teamLeadershipCandidates.filter((candidate) => !headIds.has(candidate.userId));

    if (leadCandidates.length < seedTeamConfigs.length * MIN_LEADS_PER_TEAM) {
      throw new Error(`Not enough unique lead candidates (${leadCandidates.length}) for ${seedTeamConfigs.length} teams.`);
    }

    const usedLeadIds = new Set<string>();

    const getLeadsForTeam = (teamIndex: number): FullUser[] => {
      const remainingTeams = seedTeamConfigs.length - teamIndex;
      const availableLeads = leadCandidates.filter((candidate) => !usedLeadIds.has(candidate.userId));

      const maxLeadsForThisTeam = Math.min(
        MAX_LEADS_PER_TEAM,
        availableLeads.length - (remainingTeams - 1) * MIN_LEADS_PER_TEAM
      );

      if (maxLeadsForThisTeam < MIN_LEADS_PER_TEAM) {
        throw new Error('TeamProcess could not assign unique leads to every team.');
      }

      const leads = this.faker.helpers.arrayElements(
        availableLeads,
        this.faker.number.int({
          min: MIN_LEADS_PER_TEAM,
          max: maxLeadsForThisTeam
        })
      );

      leads.forEach((lead) => usedLeadIds.add(lead.userId));

      return leads;
    };

    const teamCreateInputs = seedTeamConfigs.map((config, index) => {
      const head = headCandidates[index];
      const leads = getLeadsForTeam(index);

      const teamMembers = this.faker.helpers.arrayElements(
        members,
        this.faker.number.int({
          min: MIN_MEMBERS_PER_TEAM,
          max: Math.min(MAX_MEMBERS_PER_TEAM, members.length)
        })
      );

      return teamCreateInput(this.faker, organization.organizationId, head, leads, teamMembers, teamTypesByName, config);
    });

    const teams = await Promise.all(teamCreateInputs.map((data) => this.prisma.team.create({ data })));

    

    const teamsByName = teams.reduce<Record<string, Team>>((acc, team) => {
      acc[team.teamName] = team;
      return acc;
    }, {});

    const financeTeam = teams.find((_, index) => seedTeamConfigs[index]?.financeTeam);

    if (!financeTeam) {
      throw new Error('TeamProcess expected one team config to be marked as the finance team.');
    }

    return { teams, financeTeam, teamsByName };
  }
}
