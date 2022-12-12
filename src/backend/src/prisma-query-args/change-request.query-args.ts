import { Prisma } from '@prisma/client';
import scopeCRArgs from './scope-change-request.query-args';

const changeRequestRelationArgs = Prisma.validator<Prisma.Change_RequestArgs>()({
  include: {
    submitter: true,
    wbsElement: true,
    reviewer: true,
    changes: {
      include: {
        implementer: true,
        wbsElement: true
      }
    },
    scopeChangeRequest: scopeCRArgs,
    stageGateChangeRequest: true,
    activationChangeRequest: { include: { projectLead: true, projectManager: true } }
  }
});

export default changeRequestRelationArgs;
