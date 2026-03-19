import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';
import { getLinkQueryArgs } from './links.query-args.js';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args.js';
import { getProposedSolutionQueryArgs } from './proposed-solutions.query-args.js';
import { getTeamQueryArgs } from './teams.query-args.js';

export type ProjectProposedChangesQueryArgs = ReturnType<typeof getProjectProposedChangesQueryArgs>;

export type WorkPackageProposedChangesQueryArgs = ReturnType<typeof getWorkPackageProposedChangesQueryArgs>;

export type WbsProposedChangeQueryArgs = ReturnType<typeof getWbsProposedChangeQueryArgs>;

export type ScopeChangeRequestQueryArgs = ReturnType<typeof getScopeChangeRequestQueryArgs>;

const getProjectProposedChangesQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Project_Proposed_ChangesDefaultArgs>()({
    include: {
      teams: getTeamQueryArgs(organizationId),
      workPackageProposedChanges: getWorkPackageProposedChangesQueryArgs(organizationId),
      car: {
        include: {
          wbsElement: true
        }
      }
    }
  });

export const getWorkPackageProposedChangesQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_Package_Proposed_ChangesDefaultArgs>()({
    include: {
      blockedBy: true,
      wbsProposedChanges: {
        include: {
          links: getLinkQueryArgs(),
          lead: getUserQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          proposedDescriptionBulletChanges: getDescriptionBulletQueryArgs(organizationId)
        }
      }
    }
  });

export const getWbsProposedChangeQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Wbs_Proposed_ChangesDefaultArgs>()({
    include: {
      projectProposedChanges: getProjectProposedChangesQueryArgs(organizationId),
      workPackageProposedChanges: getWorkPackageProposedChangesQueryArgs(organizationId),
      links: getLinkQueryArgs(),
      lead: getUserQueryArgs(organizationId),
      manager: getUserQueryArgs(organizationId),
      proposedDescriptionBulletChanges: getDescriptionBulletQueryArgs(organizationId)
    }
  });

export const getScopeChangeRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Scope_CRDefaultArgs>()({
    include: {
      why: true,
      proposedSolutions: getProposedSolutionQueryArgs(organizationId),
      wbsProposedChanges: getWbsProposedChangeQueryArgs(organizationId),
      wbsOriginalData: getWbsProposedChangeQueryArgs(organizationId)
    }
  });
