import { Prisma } from '@prisma/client';
import scopeCRArgs from './scope-change-requests.query-args';

export const changeRequestQueryArgs = Prisma.validator<Prisma.Change_RequestArgs>()({
  include: {
    submitter: true,
    wbsElement: true,
    reviewer: true,
    changes: {
      where: {
        wbsElement: {
          dateDeleted: null
        }
      },
      include: {
        implementer: true,
        wbsElement: true
      }
    },
    scopeChangeRequest: scopeCRArgs,
    stageGateChangeRequest: true,
    activationChangeRequest: { include: { projectLead: true, projectManager: true } },
    deletedBy: true,
    requestedReviewers: true
  }
});
