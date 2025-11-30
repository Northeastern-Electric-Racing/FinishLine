import { Prisma } from '@prisma/client';
import { calculateEndDate, RetrospectiveWorkPackage, WorkPackage, WorkPackagePreview, WorkPackageStage } from 'shared';
import descriptionBulletTransformer from '../transformers/description-bullets.transformer';
import { convertStatus, wbsNumOf } from '../utils/utils';
import { userTransformer } from './user.transformer';
import { WorkPackageQueryArgs, WorkPackagePreviewQueryArgs } from '../prisma-query-args/work-packages.query-args';
import { teamTypeTransformer } from './team-types.transformer';
import { eventPreviewTransformer } from './calendar.transformer';

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
    events: wpInput.events
      .filter((event) => event.workPackages.length > 0) // Only events that are design reviews (have work packages)
      .map((event) => eventPreviewTransformer(event, `${wpInput.project.wbsElement.name} - ${wpInput.wbsElement.name}`)),
    deleted: wpInput.wbsElement.dateDeleted !== null
  };
};

export const workPackagePreviewTransformer = (
  wpInput: Prisma.Work_PackageGetPayload<WorkPackagePreviewQueryArgs>
): WorkPackagePreview => {
  return {
    ...wpInput,
    stage: (wpInput.stage as WorkPackageStage) ?? undefined,
    id: wpInput.workPackageId,
    status: convertStatus(wpInput.wbsElement.status),
    projectName: wpInput.project.wbsElement.name,
    dateCreated: wpInput.wbsElement.dateCreated,
    name: wpInput.wbsElement.name,
    wbsNum: { ...wpInput.wbsElement },
    deleted: wpInput.wbsElement.dateDeleted === null,
    endDate: calculateEndDate(wpInput.startDate, wpInput.duration),
    lead: wpInput.wbsElement.lead ?? undefined,
    manager: wpInput.wbsElement.manager ?? undefined,
    projectId: wpInput.project.projectId,
    wbsElementId: wpInput.wbsElement.wbsElementId
  };
};

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
