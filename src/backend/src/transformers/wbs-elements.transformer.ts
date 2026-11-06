import { Prisma } from '@prisma/client';
import { BaseProject, BaseWbsElement, BaseWorkPackage, calculateEndDate, WorkPackageStage } from 'shared';
import {
  BaseProjectQueryArgs,
  BaseWbsElementQueryArgs,
  BaseWorkPackageQueryArgs
} from '../prisma-query-args/wbs-elements.query-args.js';
import { convertStatus, wbsNumOf } from '../utils/utils.js';

// these live together for the same reason as their query args: see wbs-elements.query-args.ts

// takes the project or work package row, since the wbs element id lives there rather than in the nested select
export const baseWbsElementTransformer = ({
  wbsElementId,
  wbsElement
}: {
  wbsElementId: string;
  wbsElement: Prisma.WBS_ElementGetPayload<BaseWbsElementQueryArgs>;
}): BaseWbsElement => ({
  wbsElementId,
  wbsNum: wbsNumOf(wbsElement),
  name: wbsElement.name,
  dateCreated: wbsElement.dateCreated,
  deleted: wbsElement.dateDeleted !== null,
  leadId: wbsElement.leadId ?? undefined,
  managerId: wbsElement.managerId ?? undefined
});

export const baseProjectTransformer = (project: Prisma.ProjectGetPayload<BaseProjectQueryArgs>): BaseProject => ({
  ...baseWbsElementTransformer(project),
  id: project.projectId,
  budget: project.budget,
  summary: project.summary,
  abbreviation: project.abbreviation ?? undefined,
  carId: project.carId
});

export const baseWorkPackageTransformer = (
  workPackage: Prisma.Work_PackageGetPayload<BaseWorkPackageQueryArgs>
): BaseWorkPackage => ({
  ...baseWbsElementTransformer(workPackage),
  id: workPackage.workPackageId,
  projectId: workPackage.projectId,
  status: convertStatus(workPackage.wbsElement.status),
  orderInProject: workPackage.orderInProject,
  startDate: workPackage.startDate,
  duration: workPackage.duration,
  endDate: calculateEndDate(workPackage.startDate, workPackage.duration),
  stage: (workPackage.stage as WorkPackageStage) || undefined
});
