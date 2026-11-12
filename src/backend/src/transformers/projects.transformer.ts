import { Prisma } from '@prisma/client';
import {
  BaseProject,
  calculateDuration,
  calculateProjectEndDate,
  calculateProjectStartDate,
  DesignReviewMarker,
  EventStatus,
  ProjectListItem,
  ProjectOverviewCard,
  WbsElementStatus,
  WorkPackageStage
} from 'shared';
import { wbsNumOf } from '../utils/utils.js';
import { calculateProjectStatus } from '../utils/projects.utils.js';
import { baseUserTransformer } from './user.transformer.js';
import { baseWorkPackageTransformer } from './work-packages.transformer.js';
import {
  BaseProjectQueryArgs,
  DesignReviewMarkerQueryArgs,
  ProjectListItemQueryArgs,
  ProjectOverviewCardQueryArgs
} from '../prisma-query-args/projects.query-args.js';

export const baseProjectTransformer = (project: Prisma.ProjectGetPayload<BaseProjectQueryArgs>): BaseProject => {
  const { wbsElement, workPackages } = project;
  return {
    id: project.projectId,
    wbsElementId: project.wbsElementId,
    wbsNum: wbsNumOf(wbsElement),
    name: wbsElement.name,
    status: calculateProjectStatus(project),
    lead: wbsElement.lead ? baseUserTransformer(wbsElement.lead) : undefined,
    manager: wbsElement.manager ? baseUserTransformer(wbsElement.manager) : undefined,
    budget: project.budget,
    summary: project.summary,
    abbreviation: project.abbreviation ?? undefined,
    teams: project.teams.map(({ teamId, teamName }) => ({ teamId, teamName })),
    startDate: calculateProjectStartDate(workPackages),
    endDate: calculateProjectEndDate(workPackages),
    duration: calculateDuration(workPackages)
  };
};

export const projectListItemTransformer = (project: Prisma.ProjectGetPayload<ProjectListItemQueryArgs>): ProjectListItem => {
  // a project on several teams of the same type lists that type once
  const teamTypes = new Map<string, { teamTypeId: string; name: string }>();
  project.teams.forEach(({ teamType }) => {
    if (teamType) teamTypes.set(teamType.teamTypeId, teamType);
  });
  const firstActive = project.workPackages.find((wp) => wp.wbsElement.status === WbsElementStatus.Active);

  return {
    ...baseProjectTransformer(project),
    numWorkPackages: project.workPackages.length,
    teamTypes: Array.from(teamTypes.values()),
    activeStage: (firstActive?.stage as WorkPackageStage | null) ?? undefined
  };
};

export const projectOverviewCardTransformer = (
  project: Prisma.ProjectGetPayload<ProjectOverviewCardQueryArgs>
): ProjectOverviewCard => {
  return {
    ...baseProjectTransformer(project),
    tasksRemaining: project.workPackages.reduce(
      (total, wp) => total + wp.wbsElement._count.tasks,
      project.wbsElement._count.tasks
    ),
    links: project.wbsElement.links,
    activeWorkPackages: project.workPackages
      .filter((wp) => wp.wbsElement.status === WbsElementStatus.Active)
      .map(baseWorkPackageTransformer)
  };
};

export const designReviewMarkerTransformer = (
  event: Prisma.EventGetPayload<DesignReviewMarkerQueryArgs>,
  wbsName: string
): DesignReviewMarker => ({
  eventId: event.eventId,
  // the first scheduled time, or the requested date while it's still being scheduled
  dateScheduled: event.scheduledTimes[0]?.startTime ?? event.initialDateScheduled ?? new Date(),
  status: event.status as EventStatus,
  wbsName
});
