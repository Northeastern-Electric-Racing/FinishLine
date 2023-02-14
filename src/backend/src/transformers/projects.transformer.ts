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
import { descBulletConverter, wbsNumOf } from '../utils/utils';
import riskTransformer from '../transformers/risks.transformer';
import { calculateWorkPackageProgress } from '../utils/work-packages.utils';
import userTransformer from '../transformers/user.transformer';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import { calculateProjectStatus } from '../utils/projects.utils';

const projectTransformer = (project: Prisma.ProjectGetPayload<typeof projectQueryArgs>): Project => {
  const { wbsElement } = project;
  const wbsNum = wbsNumOf(wbsElement);

  const { projectLead, projectManager } = wbsElement;

  return {
    id: project.projectId,
    wbsNum,
    dateCreated: wbsElement.dateCreated,
    name: wbsElement.name,
    status: calculateProjectStatus(project),
    projectLead: projectLead ? userTransformer(projectLead) : undefined,
    projectManager: projectManager ? userTransformer(projectManager) : undefined,
    changes: wbsElement.changes.map((change) => ({
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      wbsNum,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    team: project.team ? project.team : undefined,
    summary: project.summary,
    budget: project.budget,
    gDriveLink: project.googleDriveFolderLink ?? undefined,
    taskListLink: project.taskListLink ?? undefined,
    slideDeckLink: project.slideDeckLink ?? undefined,
    bomLink: project.bomLink ?? undefined,
    rules: project.rules,
    duration: calculateDuration(project.workPackages),
    startDate: calculateProjectStartDate(project.workPackages),
    endDate: calculateProjectEndDate(project.workPackages),
    goals: project.goals.map(descBulletConverter),
    features: project.features.map(descBulletConverter),
    otherConstraints: project.otherConstraints.map(descBulletConverter),
    risks: project.risks.map(riskTransformer),
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
        status: workPackage.wbsElement.status as WbsElementStatus,
        projectLead: workPackage.wbsElement.projectLead ? userTransformer(workPackage.wbsElement.projectLead) : undefined,
        projectManager: workPackage.wbsElement.projectManager
          ? userTransformer(workPackage.wbsElement.projectManager)
          : undefined,
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
        dependencies: workPackage.dependencies.map(wbsNumOf),
        expectedActivities: workPackage.expectedActivities.map(descBulletConverter),
        deliverables: workPackage.deliverables.map(descBulletConverter),
        projectName: wbsElement.name,
        stage: (workPackage.stage ?? undefined) as WorkPackageStage
      };
    })
  };
};

export default projectTransformer;
