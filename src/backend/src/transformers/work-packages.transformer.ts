import { Prisma } from '@prisma/client';
import {
  BaseWorkPackage,
  calculateEndDate,
  RetrospectiveWorkPackage,
  WorkPackage,
  WorkPackageCard,
  WorkPackageDetail,
  WorkPackageStage
} from 'shared';
import descriptionBulletTransformer, {
  baseDescriptionBulletTransformer
} from '../transformers/description-bullets.transformer.js';
import { convertStatus, wbsNumOf } from '../utils/utils.js';
import { baseUserTransformer, userTransformer } from './user.transformer.js';
import {
  BaseWorkPackageQueryArgs,
  WorkPackageCardQueryArgs,
  WorkPackageDetailQueryArgs,
  WorkPackageQueryArgs
} from '../prisma-query-args/work-packages.query-args.js';
import { teamTypeTransformer } from './team-types.transformer.js';
import { eventPreviewTransformer } from './calendar.transformer.js';

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

/** @deprecated Use baseWorkPackageTransformer or a per-endpoint transformer. Still used by projects.transformer.ts until projects is refactored */
const workPackageTransformer = (wpInput: Prisma.Work_PackageGetPayload<WorkPackageQueryArgs>): WorkPackage => {
  const wbsNum = wbsNumOf(wpInput.wbsElement);
  return {
    wbsElementId: wpInput.wbsElementId,
    links: [],
    projectId: wpInput.projectId,
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
      changeRequestIdentifier: change.changeRequest.identifier,
      changeRequestId: change.changeRequestId,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    teamTypes: wpInput.project.teams.flatMap((team) => team.teamType ?? []).map(teamTypeTransformer),
    projectName: wpInput.project.wbsElement.name,
    stage: (wpInput.stage as WorkPackageStage) || undefined,
    blocking: wpInput.wbsElement.blocking.map((wp) => wbsNumOf(wp.wbsElement)),
    events: wpInput.events.map((event) =>
      eventPreviewTransformer(event, `${wpInput.project.wbsElement.name} - ${wpInput.wbsElement.name}`)
    ),
    deleted: wpInput.wbsElement.dateDeleted !== null
  };
};

/** @deprecated Still used by projects.transformer.ts (retrospective timelines) until projects is refactored */
export const retrospectiveWorkPackageTransformer = (
  wpInput: Prisma.Work_PackageGetPayload<WorkPackageQueryArgs> & { originalStartDate: Date; originalDuration: number }
): RetrospectiveWorkPackage => {
  return {
    ...workPackageTransformer(wpInput),
    originalStartDate: wpInput.originalStartDate,
    originalDuration: wpInput.originalDuration
  };
};

export default workPackageTransformer;
