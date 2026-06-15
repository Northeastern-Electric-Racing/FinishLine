import { Prisma } from '@prisma/client';
import { getScopeChangeRequestQueryArgs } from './scope-change-requests.query-args.js';
import { getUserQueryArgs } from './user.query-args.js';
import { getWorkPackageQueryArgs } from './work-packages.query-args.js';
import { getReimbursementProductOtherReasonQueryArgs } from './reimbursement-product-other-reason.query-args.js';
import { getAccountCodeQueryArgs } from './account-code.query-args.js';

export type ChangeRequestQueryArgs = ReturnType<typeof getChangeRequestQueryArgs>;

export type ChangeRequestWithProjectAndWorkPackageQueryArgs = ReturnType<
  typeof getChangeRequestWithProjectAndWorkPackageQueryArgs
>;

export type ChangeRequestManyQueryArgs = ReturnType<typeof getManyChangeRequestQueryArgs>;

export const getChangeRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Change_RequestDefaultArgs>()({
    include: {
      submitter: getUserQueryArgs(organizationId),
      wbsElement: true,
      category: getReimbursementProductOtherReasonQueryArgs(organizationId),
      accountCode: getAccountCodeQueryArgs(organizationId),
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
      budgetChangeRequest: true,
      deletedBy: getUserQueryArgs(organizationId),
      requestedReviewers: getUserQueryArgs(organizationId),
      leadershipChangeRequest: {
        include: { lead: getUserQueryArgs(organizationId), manager: getUserQueryArgs(organizationId) }
      }
    }
  });

export const getManyChangeRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Change_RequestDefaultArgs>()({
    include: {
      submitter: getUserQueryArgs(organizationId),
      wbsElement: true,
      category: getReimbursementProductOtherReasonQueryArgs(organizationId),
      accountCode: getAccountCodeQueryArgs(organizationId),
      reviewer: getUserQueryArgs(organizationId),
      stageGateChangeRequest: true,
      changes: true,
      activationChangeRequest: {
        include: { lead: getUserQueryArgs(organizationId), manager: getUserQueryArgs(organizationId) }
      },
      budgetChangeRequest: true,
      deletedBy: getUserQueryArgs(organizationId),
      requestedReviewers: getUserQueryArgs(organizationId),
      leadershipChangeRequest: {
        include: { lead: getUserQueryArgs(organizationId), manager: getUserQueryArgs(organizationId) }
      }
    }
  });

export type ChangeRequestGuestQueryArgs = ReturnType<typeof getGuestChangeRequestQueryArgs>;

export const getGuestChangeRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Change_RequestDefaultArgs>()({
    select: {
      crId: true,
      identifier: true,
      dateSubmitted: true,
      type: true,
      accepted: true,
      dateReviewed: true,
      submitter: getUserQueryArgs(organizationId),
      reviewer: getUserQueryArgs(organizationId),
      changes: { select: { changeId: true } },
      wbsElement: {
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          name: true,
          project: {
            select: {
              wbsElement: { select: { name: true } },
              teams: {
                select: { teamType: { select: { name: true } } }
              }
            }
          },
          workPackage: {
            select: {
              project: {
                select: {
                  wbsElement: { select: { name: true } },
                  teams: {
                    select: { teamType: { select: { name: true } } }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

export const getChangeRequestWithProjectAndWorkPackageQueryArgs = (organizationId: string) =>
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
      category: getReimbursementProductOtherReasonQueryArgs(organizationId),
      accountCode: getAccountCodeQueryArgs(organizationId),
      reviewer: getUserQueryArgs(organizationId),
      changes: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        include: {
          implementer: getUserQueryArgs(organizationId),
          wbsElement: true,
          category: getReimbursementProductOtherReasonQueryArgs(organizationId),
          accountCode: getAccountCodeQueryArgs(organizationId)
        }
      },
      scopeChangeRequest: getScopeChangeRequestQueryArgs(organizationId),
      stageGateChangeRequest: true,
      activationChangeRequest: {
        include: { lead: getUserQueryArgs(organizationId), manager: getUserQueryArgs(organizationId) }
      },
      budgetChangeRequest: true,
      deletedBy: getUserQueryArgs(organizationId),
      requestedReviewers: getUserQueryArgs(organizationId),
      leadershipChangeRequest: {
        include: { lead: getUserQueryArgs(organizationId), manager: getUserQueryArgs(organizationId) }
      }
    }
  });
