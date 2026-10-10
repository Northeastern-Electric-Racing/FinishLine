import { Prisma } from '@prisma/client';
import {
  calculateEndDate,
  calculateProjectStartDate,
  EventStatus,
  GanttChartEvent,
  GanttChartProject,
  GanttChartWorkPackage,
  WorkPackageStage
} from 'shared';
import {
  GanttChartEventQueryArgs,
  GanttChartProjectQueryArgs,
  GanttChartWorkPackageQueryArgs
} from '../prisma-query-args/gantt-chart.query-args.js';
import { convertStatus, wbsNumOf } from '../utils/utils.js';
import { calculateProjectStatus } from '../utils/projects.utils.js';
import taskTransformer from './tasks.transformer.js';

export const ganttChartEventTransformer = (
  event: Prisma.EventGetPayload<GanttChartEventQueryArgs>,
  wbsName: string
): GanttChartEvent => ({
  eventId: event.eventId,
  // earliest scheduled slot, or fall back to initialDateScheduled (for confirmation events), or the current date
  dateScheduled: event.scheduledTimes[0]?.startTime ?? event.initialDateScheduled ?? new Date(),
  status: event.status as EventStatus,
  wbsName
});

export const ganttChartWorkPackageTransformer = (
  workPackage: Prisma.Work_PackageGetPayload<GanttChartWorkPackageQueryArgs>,
  projectName: string
): GanttChartWorkPackage => {
  const { wbsElement } = workPackage;
  return {
    id: workPackage.workPackageId,
    wbsElementId: workPackage.wbsElementId,
    projectId: workPackage.projectId,
    wbsNum: wbsNumOf(wbsElement),
    name: wbsElement.name,
    status: convertStatus(wbsElement.status),
    dateCreated: wbsElement.dateCreated,
    deleted: wbsElement.dateDeleted !== null,
    lead: wbsElement.lead ?? undefined,
    manager: wbsElement.manager ?? undefined,
    startDate: workPackage.startDate,
    endDate: calculateEndDate(workPackage.startDate, workPackage.duration),
    stage: (workPackage.stage as WorkPackageStage) || undefined,
    blocking: wbsElement.blocking.map((blocked) => wbsNumOf(blocked.wbsElement)),
    events: workPackage.events.map((event) => ganttChartEventTransformer(event, `${projectName} - ${wbsElement.name}`))
  };
};

export const ganttChartProjectTransformer = (
  project: Prisma.ProjectGetPayload<GanttChartProjectQueryArgs>
): GanttChartProject => {
  const { wbsElement } = project;
  return {
    id: project.projectId,
    wbsElementId: project.wbsElementId,
    wbsNum: wbsNumOf(wbsElement),
    name: wbsElement.name,
    status: calculateProjectStatus(project),
    dateCreated: wbsElement.dateCreated,
    deleted: !!wbsElement.dateDeleted,
    lead: wbsElement.lead ?? undefined,
    manager: wbsElement.manager ?? undefined,
    startDate: calculateProjectStartDate(project.workPackages),
    teams: project.teams,
    tasks: wbsElement.tasks.map(taskTransformer),
    workPackages: project.workPackages.map((workPackage) => ganttChartWorkPackageTransformer(workPackage, wbsElement.name))
  };
};
