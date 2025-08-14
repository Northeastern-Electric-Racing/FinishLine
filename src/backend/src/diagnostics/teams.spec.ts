import prisma from '../prisma/prisma';
import TeamsService from '../services/teams.services';
import { BenchSpec } from './bench-types';

let benchCounter = 0;

export const teamSpecs: BenchSpec<any>[] = [
  {
    name: 'teams.getAllTeams',
    tags: ['teams', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await TeamsService.getAllTeams(organization);
    }
  },
  {
    name: 'teams.getAllArchivedTeams',
    tags: ['teams', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await TeamsService.getAllArchivedTeams(organization);
    }
  },
  {
    name: 'teams.getSingleTeam',
    tags: ['teams', 'read'],
    async prepare(ctx) {
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!team) return { skip: 'no teams found' };
      return { inputs: { teamId: team.teamId, organization: ctx.organization } };
    },
    async run({ teamId, organization }) {
      await TeamsService.getSingleTeam(teamId, organization);
    }
  },
  {
    name: 'teams.getUsersTeams',
    tags: ['teams', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user, organization: ctx.organization } };
    },
    async run({ user, organization }) {
      await TeamsService.getUsersTeams(user, organization);
    }
  },
  {
    name: 'teams.getAllTeamTypes',
    tags: ['teams', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await TeamsService.getAllTeamTypes(organization);
    }
  },
  {
    name: 'teams.editDescription',
    tags: ['teams', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!submitter || !team) return { skip: 'missing submitter or team' };
      return {
        inputs: {
          user: submitter,
          teamId: team.teamId,
          newDescription: 'Updated team description',
          organization: ctx.organization
        }
      };
    },
    async run({ user, teamId, newDescription, organization }) {
      await TeamsService.editDescription(user, teamId, newDescription, organization);
    }
  },
  {
    name: 'teams.setTeamMembers',
    tags: ['teams', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const team = await prisma.team.findFirst({
        where: { organizationId: ctx.organization.organizationId },
        include: { members: true }
      });
      if (!submitter || !team) return { skip: 'missing submitter or team' };
      const candidates = await prisma.user.findMany({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        take: 3,
        select: { userId: true }
      });
      if (candidates.length === 0) return { skip: 'no users to set as members' };
      const userIds = candidates.map((c) => c.userId).filter((id) => id !== team.headId);
      return { inputs: { submitter, teamId: team.teamId, userIds, organization: ctx.organization } };
    },
    async run({ submitter, teamId, userIds, organization }) {
      await TeamsService.setTeamMembers(submitter, teamId, userIds, organization);
    }
  },
  {
    name: 'teams.setTeamLeads',
    tags: ['teams', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const team = await prisma.team.findFirst({
        where: { organizationId: ctx.organization.organizationId },
        include: { leads: true }
      });
      if (!submitter || !team) return { skip: 'missing submitter or team' };
      const candidates = await prisma.user.findMany({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        take: 2,
        select: { userId: true }
      });
      if (candidates.length === 0) return { skip: 'no users to set as leads' };
      const userIds = candidates.map((c) => c.userId).filter((id) => id !== team.headId);
      return { inputs: { submitter, teamId: team.teamId, userIds, organization: ctx.organization } };
    },
    async run({ submitter, teamId, userIds, organization }) {
      await TeamsService.setTeamLeads(submitter, teamId, userIds, organization);
    }
  },
  {
    name: 'teams.setTeamHead',
    tags: ['teams', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!submitter || !team) return { skip: 'missing submitter or team' };
      const headRoles = await prisma.role.findMany({
        where: { organizationId: ctx.organization.organizationId, roleType: 'HEAD' },
        select: { userId: true }
      });
      let candidateUserId: string | null = null;
      for (const { userId } of headRoles) {
        if (userId === team.headId) continue;
        const conflict = await prisma.team.findFirst({
          where: {
            organizationId: ctx.organization.organizationId,
            NOT: { teamId: team.teamId },
            OR: [{ headId: userId }, { leads: { some: { userId } } }]
          },
          select: { teamId: true }
        });
        if (!conflict) {
          candidateUserId = userId;
          break;
        }
      }
      if (!candidateUserId) return { skip: 'no eligible HEAD candidate available' };
      return { inputs: { submitter, teamId: team.teamId, userId: candidateUserId, organization: ctx.organization } };
    },
    async run({ submitter, teamId, userId, organization }) {
      await TeamsService.setTeamHead(submitter, teamId, userId, organization);
    }
  },
  {
    name: 'teams.createTeamType',
    tags: ['teams', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!submitter) return { skip: 'no admin submitter' };
      return { inputs: { submitter, organization: ctx.organization } };
    },
    async run({ submitter, organization }) {
      // retry a few times to avoid rare uniqueness collisions
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 15; attempt++) {
        const uniqueName = `BenchType-${Date.now()}-${process.pid}-${benchCounter++}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        try {
          await TeamsService.createTeamType(submitter, uniqueName, 'Icon', 'desc', organization);
          return;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr;
    }
  },
  {
    name: 'teams.getSingleTeamType',
    tags: ['teams', 'read'],
    async prepare(ctx) {
      const tt = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!tt) return { skip: 'no team type found' };
      return { inputs: { teamTypeId: tt.teamTypeId, organization: ctx.organization } };
    },
    async run({ teamTypeId, organization }) {
      await TeamsService.getSingleTeamType(teamTypeId, organization);
    }
  },
  {
    name: 'teams.editTeamType',
    tags: ['teams', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const tt = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!submitter || !tt) return { skip: 'missing submitter or team type' };
      return {
        inputs: {
          user: submitter,
          teamTypeId: tt.teamTypeId,
          name: tt.name,
          iconName: tt.iconName ?? 'Icon',
          description: 'new desc',
          organization: ctx.organization
        }
      };
    },
    async run({ user, teamTypeId, name, iconName, description, organization }) {
      await TeamsService.editTeamType(user, teamTypeId, name, iconName, description, organization);
    }
  },
  {
    name: 'teams.setTeamType',
    tags: ['teams', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      const team = await prisma.team.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      const tt = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!submitter || !team || !tt) return { skip: 'missing submitter, team, or team type' };
      return { inputs: { submitter, teamId: team.teamId, teamTypeId: tt.teamTypeId, organization: ctx.organization } };
    },
    async run({ submitter, teamId, teamTypeId, organization }) {
      await TeamsService.setTeamType(submitter, teamId, teamTypeId, organization);
    }
  },
  {
    name: 'teams.setOnboardingUser',
    tags: ['teams', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const tt = await prisma.team_Type.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!submitter || !tt) return { skip: 'missing submitter or team type' };
      return { inputs: { submitter, teamTypeId: tt.teamTypeId, organization: ctx.organization } };
    },
    async run({ submitter, teamTypeId, organization }) {
      await TeamsService.setOnboardingUser(submitter, teamTypeId, organization);
    }
  },
  {
    name: 'teams.completeOnboarding',
    tags: ['teams', 'write'],
    async prepare(ctx) {
      const submitter = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!submitter) return { skip: 'no submitter' };
      return { inputs: { submitter } };
    },
    async run({ submitter }) {
      await TeamsService.completeOnboarding(submitter);
    }
  },
  {
    name: 'teams.getMyTeamsWorkpackages',
    tags: ['teams', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user, organization: ctx.organization } };
    },
    async run({ user, organization }) {
      await TeamsService.getMyTeamsWorkpackages(user, organization);
    }
  }
];
