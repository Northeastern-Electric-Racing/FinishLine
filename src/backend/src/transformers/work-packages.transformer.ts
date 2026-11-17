import { Prisma } from '@prisma/client';
import { BaseWorkPackage, calculateEndDate, WorkPackageCard, WorkPackageDetail, WorkPackageStage } from 'shared';
import { baseDescriptionBulletTransformer } from '../transformers/description-bullets.transformer.js';
import { convertStatus, wbsNumOf } from '../utils/utils.js';
import { baseUserTransformer } from './user.transformer.js';
import {
  BaseWorkPackageQueryArgs,
  WorkPackageCardQueryArgs,
  WorkPackageDetailQueryArgs
} from '../prisma-query-args/work-packages.query-args.js';

export const baseWorkPackageTransformer = (
  wp: Prisma.Work_PackageGetPayload<BaseWorkPackageQueryArgs>
): BaseWorkPackage => ({
  id: wp.workPackageId,
  wbsElementId: wp.wbsElementId,
  projectId: wp.projectId,
  wbsNum: wbsNumOf(wp.wbsElement),
  name: wp.wbsElement.name,
  status: convertStatus(wp.wbsElement.status),
  stage: (wp.stage as WorkPackageStage) ?? undefined,
  startDate: wp.startDate,
  duration: wp.duration,
  endDate: calculateEndDate(wp.startDate, wp.duration),
  orderInProject: wp.orderInProject,
  lead: wp.wbsElement.lead ? baseUserTransformer(wp.wbsElement.lead) : undefined,
  manager: wp.wbsElement.manager ? baseUserTransformer(wp.wbsElement.manager) : undefined,
  projectName: wp.project.wbsElement.name
});

export const workPackageDetailTransformer = (
  wp: Prisma.Work_PackageGetPayload<WorkPackageDetailQueryArgs>
): WorkPackageDetail => ({
  ...baseWorkPackageTransformer(wp),
  blockedBy: wp.blockedBy.map((blocker) => ({ wbsNum: wbsNumOf(blocker), name: blocker.name })),
  descriptionBullets: wp.wbsElement.descriptionBullets.map(baseDescriptionBulletTransformer),
  changes: wp.wbsElement.changes.map((change) => ({
    changeId: change.changeId,
    changeRequestId: change.changeRequestId,
    changeRequestIdentifier: change.changeRequest.identifier,
    detail: change.detail,
    dateImplemented: change.dateImplemented,
    implementer: baseUserTransformer(change.implementer)
  }))
});

export const workPackageCardTransformer = (
  wp: Prisma.Work_PackageGetPayload<WorkPackageCardQueryArgs>
): WorkPackageCard => ({
  ...baseWorkPackageTransformer(wp),
  blockedBy: wp.blockedBy.map((blocker) => ({
    wbsNum: wbsNumOf(blocker),
    name: blocker.name,
    // blockers are always work packages, but the relation is to any wbs element
    projectName: blocker.workPackage?.project.wbsElement.name ?? ''
  }))
});
