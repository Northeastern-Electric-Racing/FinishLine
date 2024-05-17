import { Prisma } from '@prisma/client';
import scopeCRArgs from './scope-change-requests.query-args';
import projectQueryArgs from './projects.query-args';
import workPackageQueryArgs from './work-packages.query-args';

export const changeRequestQueryArgs = Prisma.validator<Prisma.Change_RequestArgs>()({
  include: {
    submitter: true,
    wbsElement: {
      include: {
        project: projectQueryArgs,
        workPackage: workPackageQueryArgs
      }
    },
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
