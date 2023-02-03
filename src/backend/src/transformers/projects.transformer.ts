import { Prisma } from '@prisma/client';
import {
  Project,
  WbsElementStatus,
  calculateDuration,
  calculateProjectStartDate,
  calculateProjectEndDate,
  calculateEndDate,
  calculatePercentExpectedProgress,
  calculateTimelineStatus
} from 'shared';
import { calculateProjectStatus } from '../utils/projects.utils';
import projectRelationArgs from '../prisma-query-args/projects.query-args';
import { descBulletConverter, wbsNumOf } from '../utils/utils';
import { userTransformer } from '../utils/users.utils';
import { calculateWorkPackageProgress } from '../utils/work-packages.utils';
import riskTransformer from '../transformers/risks.transformer';

const projectTransformer = (project: Prisma.ProjectGetPayload<typeof projectRelationArgs>): Project => {
  /*payload: Prisma.ProjectGetPayload<typeof manyRelationArgs> | Prisma.WBS_ElementGetPayload<typeof uniqueRelationArgs>
): Project => {
  const wbsElement = 'wbsElement' in payload ? payload.wbsElement : payload;
  const project = 'project' in payload ? payload.project! : payload;
  const wbsNum = wbsNumOf(wbsElement);
  let team = undefined;
  if (project.team) {
    team = {
      teamId: project.team.teamId,
      teamName: project.team.teamName
    };
  }
  const { projectLead, projectManager } = wbsElement;*/

  return {
    id: project.projectId,
    wbsNum: wbsNumOf(project.wbsElement),
    dateCreated: project.wbsElement.dateCreated,
    name: project.wbsElement.name,
    status: calculateProjectStatus(project),
    projectLead: project.wbsElement.projectLead ? userTransformer(project.wbsElement.projectLead) : undefined,
    projectManager: project.wbsElement.projectManager ? userTransformer(project.wbsElement.projectManager) : undefined,
    changes: project.wbsElement.changes.map((change) => ({
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      wbsNum: wbsNumOf(project.wbsElement),
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    team: project.team,
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
        projectName: project.wbsElement.name
      };
    })
  };
};

export default projectTransformer;
