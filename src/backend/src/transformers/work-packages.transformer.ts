import { Prisma } from '@prisma/client';
import { calculateEndDate, calculatePercentExpectedProgress, calculateTimelineStatus, WorkPackage } from 'shared';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import descriptionBulletTransformer from '../transformers/description-bullets.transformer';
import { convertStatus, wbsNumOf } from '../utils/utils';
import { calculateWorkPackageProgress } from '../utils/work-packages.utils';
import { userTransformer } from './user.transformer';

const workPackageTransformer = (wpInput: Prisma.Work_PackageGetPayload<typeof workPackageQueryArgs>): WorkPackage => {
  const expectedProgress = calculatePercentExpectedProgress(wpInput.startDate, wpInput.duration, wpInput.wbsElement.status);
  const wbsNum = wbsNumOf(wpInput.wbsElement);
  const progress = calculateWorkPackageProgress(wpInput.deliverables, wpInput.expectedActivities);
  return {
    id: wpInput.workPackageId,
    dateCreated: wpInput.wbsElement.dateCreated,
    name: wpInput.wbsElement.name,
    orderInProject: wpInput.orderInProject,
    progress,
    startDate: wpInput.startDate,
    duration: wpInput.duration,
    expectedActivities: wpInput.expectedActivities.map(descriptionBulletTransformer),
    deliverables: wpInput.deliverables.map(descriptionBulletTransformer),
    blockedBy: wpInput.blockedBy.map(wbsNumOf),
    projectManager: wpInput.wbsElement.projectManager ? userTransformer(wpInput.wbsElement.projectManager) : undefined,
    projectLead: wpInput.wbsElement.projectLead ? userTransformer(wpInput.wbsElement.projectLead) : undefined,
    status: convertStatus(wpInput.wbsElement.status),
    wbsNum,
    endDate: calculateEndDate(wpInput.startDate, wpInput.duration),
    expectedProgress,
    timelineStatus: calculateTimelineStatus(progress, expectedProgress),
    changes: wpInput.wbsElement.changes.map((change) => ({
      wbsNum,
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    projectName: wpInput.project.wbsElement.name,
    stage: wpInput.stage || undefined
  } as WorkPackage;
};

export default workPackageTransformer;
