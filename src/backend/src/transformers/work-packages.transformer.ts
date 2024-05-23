import { Prisma } from '@prisma/client';
import { calculateEndDate, WorkPackage, WorkPackageStage } from 'shared';
import descriptionBulletTransformer from '../transformers/description-bullets.transformer';
import { convertStatus, wbsNumOf } from '../utils/utils';
import { userTransformer } from './user.transformer';
import { WorkPackageQueryArgs } from '../prisma-query-args/work-packages.query-args';

const workPackageTransformer = (wpInput: Prisma.Work_PackageGetPayload<WorkPackageQueryArgs>): WorkPackage => {
  const wbsNum = wbsNumOf(wpInput.wbsElement);
  return {
    wbsElementId: wpInput.wbsElementId,
    links: [],
    materials: [],
    assemblies: [],
    id: wpInput.workPackageId,
    dateCreated: wpInput.wbsElement.dateCreated,
    name: wpInput.wbsElement.name,
    orderInProject: wpInput.orderInProject,
    startDate: wpInput.startDate,
    duration: wpInput.duration,
    descriptionBullets: wpInput.wbsElement.descriptionBullets.map(descriptionBulletTransformer),
    blockedBy: wpInput.blockedBy.map(wbsNumOf),
    manager: wpInput.wbsElement.manager ? userTransformer(wpInput.wbsElement.manager) : undefined,
    lead: wpInput.wbsElement.lead ? userTransformer(wpInput.wbsElement.lead) : undefined,
    status: convertStatus(wpInput.wbsElement.status),
    wbsNum,
    endDate: calculateEndDate(wpInput.startDate, wpInput.duration),
    changes: wpInput.wbsElement.changes.map((change) => ({
      wbsNum,
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    projectName: wpInput.project.wbsElement.name,
    stage: (wpInput.stage as WorkPackageStage) || undefined
  };
};

export default workPackageTransformer;
