import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';
import { getBaseProjectQueryArgs } from './wbs-elements.query-args.js';

export type TeamQueryArgs = ReturnType<typeof getTeamQueryArgs>;
/** @deprecated Use BaseTeamQueryArgs. Still used by teams.transformer.ts (teamBaseTransformer) until teams is refactored */
export type TeamBaseQueryArgs = ReturnType<typeof getTeamBaseQueryArgs>;
export type BaseTeamQueryArgs = ReturnType<typeof getBaseTeamQueryArgs>;
export type TeamPreviewQueryArgs = ReturnType<typeof getTeamPreviewQueryArgs>;
export type TeamWithProjectsQueryArgs = ReturnType<typeof getTeamWithProjectsQueryArgs>;
export type TeamJoinRequestQueryArgs = ReturnType<typeof getTeamJoinRequestQueryArgs>;

export const getTeamQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    include: {
      members: getUserQueryArgs(organizationId),
      head: getUserQueryArgs(organizationId),
      leads: getUserQueryArgs(organizationId),
      userArchived: getUserQueryArgs(organizationId),
      teamType: { select: { teamTypeId: true, name: true } },
      projects: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        select: {
          ...getBaseProjectQueryArgs().select,
          // just enough of each work package to compute the project's status and show the guest card's stage
          workPackages: {
            where: { wbsElement: { dateDeleted: null } },
            orderBy: [{ orderInProject: 'asc' }, { wbsElement: { workPackageNumber: 'asc' } }],
            select: { stage: true, wbsElement: { select: { status: true } } }
          }
        }
      }
    }
  });

// the minimum every consumer of a team needs
export const getBaseTeamQueryArgs = () =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    select: {
      teamId: true,
      teamName: true,
      slackId: true,
      description: true,
      dateArchived: true,
      financeTeam: true,
      operationsTeam: true,
      teamTypeId: true,
      headId: true
    }
  });

/** @deprecated Use getBaseTeamQueryArgs. Still used by teams.services.ts (getAllTeamPreviews) until teams is refactored */
export const getTeamBaseQueryArgs = () => {
  return Prisma.validator<Prisma.TeamDefaultArgs>()({
    include: {
      teamType: true
    }
  });
};

export const getTeamPreviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    include: {
      members: getUserQueryArgs(organizationId),
      head: getUserQueryArgs(organizationId),
      leads: getUserQueryArgs(organizationId),
      teamType: true
    }
  });

export const getTeamWithProjectsQueryArgs = () =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    select: {
      teamId: true,
      teamName: true,
      dateArchived: true,
      head: { select: { userId: true, firstName: true, lastName: true } },
      _count: { select: { members: true, leads: true } },
      projects: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        select: {
          wbsElement: {
            select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true }
          }
        }
      }
    }
  });

export const getTeamJoinRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Team_Join_RequestDefaultArgs>()({
    include: {
      user: getUserQueryArgs(organizationId),
      team: getTeamPreviewQueryArgs(organizationId),
      reviewedBy: getUserQueryArgs(organizationId)
    }
  });
