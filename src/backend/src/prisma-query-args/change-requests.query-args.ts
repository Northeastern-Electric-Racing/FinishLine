import { Prisma } from '@prisma/client';
import { getScopeChangeRequestQueryArgs } from './scope-change-requests.query-args';
import { getUserQueryArgs } from './user.query-args';
import { getWorkPackageQueryArgs } from './work-packages.query-args';

export type ChangeRequestQueryArgs = ReturnType<typeof getChangeRequestQueryArgs>;

export const getChangeRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Change_RequestDefaultArgs>()({
    include: {
      submitter: getUserQueryArgs(organizationId),
      wbsElement: {
        include: {
          workPackage: getWorkPackageQueryArgs(organizationId),
          project: {
            include: {
              teams: true
            }
          },
          descriptionBullets: { where: { dateDeleted: null } },
          links: { where: { dateDeleted: null } }
        }
      },
      reviewer: getUserQueryArgs(organizationId),
      changes: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        include: {
          implementer: getUserQueryArgs(organizationId),
          wbsElement: true
        }
      },
      scopeChangeRequest: getScopeChangeRequestQueryArgs(organizationId),
      stageGateChangeRequest: true,
      activationChangeRequest: {
        include: { lead: getUserQueryArgs(organizationId), manager: getUserQueryArgs(organizationId) }
      },
      deletedBy: getUserQueryArgs(organizationId),
      requestedReviewers: getUserQueryArgs(organizationId)
    }
  });
