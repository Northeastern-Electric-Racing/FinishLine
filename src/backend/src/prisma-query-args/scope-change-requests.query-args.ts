import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getLinkQueryArgs } from './links.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getProposedSolutionQueryArgs } from './proposed-solutions.query-args';
import { getTeamQueryArgs } from './teams.query-args';

export type ProjectProposedChangesQueryArgs = ReturnType<typeof getProjectProposedChangesQueryArgs>;

export type WorkPackageProposedChangesQueryArgs = typeof workPackageProposedChangesQueryArgs;

export type WbsProposedChangeQueryArgs = ReturnType<typeof getWbsProposedChangeQueryArgs>;

export type ScopeChangeRequestQueryArgs = ReturnType<typeof getScopeChangeRequestQueryArgs>;

const getProjectProposedChangesQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Project_Proposed_ChangesArgs>()({
    include: {
      teams: getTeamQueryArgs(organizationId),
      car: {
        include: {
          wbsElement: true
        }
      }
    }
  });

const workPackageProposedChangesQueryArgs = Prisma.validator<Prisma.Work_Package_Proposed_ChangesArgs>()({
  include: {
    blockedBy: true
  }
});

export const getWbsProposedChangeQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Wbs_Proposed_ChangesArgs>()({
    include: {
      projectProposedChanges: getProjectProposedChangesQueryArgs(organizationId),
      workPackageProposedChanges: workPackageProposedChangesQueryArgs,
      links: getLinkQueryArgs(organizationId),
      lead: getUserQueryArgs(organizationId),
      manager: getUserQueryArgs(organizationId),
      proposedDescriptionBulletChanges: getDescriptionBulletQueryArgs(organizationId)
    }
  });

export const getScopeChangeRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Scope_CRArgs>()({
    include: {
      why: true,
      proposedSolutions: getProposedSolutionQueryArgs(organizationId),
      wbsProposedChanges: getWbsProposedChangeQueryArgs(organizationId)
    }
  });
