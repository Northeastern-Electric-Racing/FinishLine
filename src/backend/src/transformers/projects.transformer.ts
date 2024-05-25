import { Prisma } from '@prisma/client';
import {
  Project,
  WbsElementStatus,
  calculateEndDate,
  calculateProjectEndDate,
  calculateDuration,
  calculateProjectStartDate,
  WorkPackageStage
} from 'shared';
import { wbsNumOf } from '../utils/utils';
import taskTransformer from './tasks.transformer';
import { calculateProjectStatus } from '../utils/projects.utils';
import { linkTransformer } from './links.transformer';
import { descBulletConverter } from '../utils/description-bullets.utils';
import { assemblyTransformer, materialTransformer } from './material.transformer';
import { userTransformer } from './user.transformer';
import { ProjectQueryArgs } from '../prisma-query-args/projects.query-args';
import teamTransformer from './teams.transformer';

const projectTransformer = (project: Prisma.ProjectGetPayload<ProjectQueryArgs>): Project => {
  const { wbsElement } = project;
  const wbsNum = wbsNumOf(wbsElement);

  const { lead, manager } = wbsElement;

  return {
    wbsElementId: wbsElement.wbsElementId,
    id: project.projectId,
    wbsNum,
    dateCreated: wbsElement.dateCreated,
    name: wbsElement.name,
    status: calculateProjectStatus(project),
    lead: lead ? userTransformer(lead) : undefined,
    manager: manager ? userTransformer(manager) : undefined,
    changes: wbsElement.changes.map((change) => ({
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      wbsNum,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    favoritedBy: project.favoritedBy.map(userTransformer),
    teams: project.teams.map(teamTransformer),
    summary: project.summary,
    budget: project.budget,
    links: project.wbsElement.links.map(linkTransformer),
    duration: calculateDuration(project.workPackages),
    startDate: calculateProjectStartDate(project.workPackages),
    endDate: calculateProjectEndDate(project.workPackages),
    descriptionBullets: wbsElement.descriptionBullets.map(descBulletConverter),
    tasks: wbsElement.tasks.map(taskTransformer),
    materials: wbsElement.materials.map(materialTransformer),
    assemblies: wbsElement.assemblies.map(assemblyTransformer),
    workPackages: project.workPackages.map((workPackage) => {
      const endDate = calculateEndDate(workPackage.startDate, workPackage.duration);

      return {
        wbsElementId: workPackage.wbsElementId,
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
        startDate: workPackage.startDate,
        endDate,
        duration: workPackage.duration,
        blockedBy: workPackage.blockedBy.map(wbsNumOf),
        descriptionBullets: workPackage.wbsElement.descriptionBullets.map(descBulletConverter),
        projectName: wbsElement.name,
        teamTypeId: project.teams[0]?.teamTypeId ?? '',
        stage: (workPackage.stage || undefined) as WorkPackageStage,
        materials: workPackage.wbsElement?.materials.map(materialTransformer),
        assemblies: workPackage.wbsElement?.assemblies.map(assemblyTransformer)
      };
    })
  };
};

export default projectTransformer;
