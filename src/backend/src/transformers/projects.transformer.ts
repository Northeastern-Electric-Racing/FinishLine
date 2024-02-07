import { Prisma } from '@prisma/client';
import {
  Project,
  WbsElementStatus,
  calculateEndDate,
  calculateProjectEndDate,
  calculatePercentExpectedProgress,
  calculateTimelineStatus,
  calculateDuration,
  calculateProjectStartDate,
  WorkPackageStage
} from 'shared';
import { wbsNumOf } from '../utils/utils';
import taskTransformer from './tasks.transformer';
import { calculateWorkPackageProgress } from '../utils/work-packages.utils';
import userTransformer from '../transformers/user.transformer';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import { calculateProjectStatus } from '../utils/projects.utils';
import { linkTransformer } from './links.transformer';
import { descBulletConverter } from '../utils/description-bullets.utils';
import { assemblyTransformer, materialTransformer } from './material.transformer';

const projectTransformer = (project: Prisma.ProjectGetPayload<typeof projectQueryArgs>): Project => {
  const { wbsElement } = project;
  const wbsNum = wbsNumOf(wbsElement);

  const { lead, manager } = wbsElement;

  return {
    id: project.projectId,
    wbsNum,
    dateCreated: wbsElement.dateCreated,
    name: wbsElement.name,
    status: calculateProjectStatus(project),
    projectLead: lead ? userTransformer(lead) : undefined,
    projectManager: manager ? userTransformer(manager) : undefined,
    changes: wbsElement.changes.map((change) => ({
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      wbsNum,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    teams: project.teams,
    summary: project.summary,
    budget: project.budget,
    links: project.wbsElement.links.map(linkTransformer),
    rules: project.rules,
    duration: calculateDuration(project.workPackages),
    startDate: calculateProjectStartDate(project.workPackages),
    endDate: calculateProjectEndDate(project.workPackages),
    goals: project.goals.map(descBulletConverter),
    features: project.features.map(descBulletConverter),
    otherConstraints: project.otherConstraints.map(descBulletConverter),
    tasks: wbsElement.tasks.map(taskTransformer),
    materials: wbsElement.materials.map(materialTransformer),
    assemblies: wbsElement.assemblies.map(assemblyTransformer),
    workPackages: project.workPackages.map((workPackage) => {
      const endDate = calculateEndDate(workPackage.startDate, workPackage.duration);
      const progress = calculateWorkPackageProgress(workPackage.deliverables, workPackage.expectedActivities);
      const expectedProgress = calculatePercentExpectedProgress(
        workPackage.startDate,
        workPackage.duration,
        workPackage.wbsElement.status
      );

      return {
        id: workPackage.workPackageId,
        wbsNum: wbsNumOf(workPackage.wbsElement),
        dateCreated: workPackage.wbsElement.dateCreated,
        name: workPackage.wbsElement.name,
        links: workPackage.wbsElement.links.map(linkTransformer),
        status: workPackage.wbsElement.status as WbsElementStatus,
        projectLead: workPackage.wbsElement.lead ? userTransformer(workPackage.wbsElement.lead) : undefined,
        projectManager: workPackage.wbsElement.manager ? userTransformer(workPackage.wbsElement.manager) : undefined,
        changes: workPackage.wbsElement.changes.map((change) => ({
          changeId: change.changeId,
          changeRequestId: change.changeRequestId,
          wbsNum: wbsNumOf(workPackage.wbsElement),
          implementer: userTransformer(change.implementer),
          detail: change.detail,
          dateImplemented: change.dateImplemented
        })),
        orderInProject: workPackage.orderInProject,
        progress,
        startDate: workPackage.startDate,
        endDate,
        duration: workPackage.duration,
        expectedProgress,
        timelineStatus: calculateTimelineStatus(progress, expectedProgress),
        blockedBy: workPackage.blockedBy.map(wbsNumOf),
        expectedActivities: workPackage.expectedActivities.map(descBulletConverter),
        deliverables: workPackage.deliverables.map(descBulletConverter),
        projectName: wbsElement.name,
        stage: (workPackage.stage || undefined) as WorkPackageStage,
        materials: workPackage.wbsElement?.materials.map(materialTransformer),
        assemblies: workPackage.wbsElement?.assemblies.map(assemblyTransformer)
      };
    })
  };
};

export default projectTransformer;
