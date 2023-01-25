import { Prisma, WBS_Element_Status } from '@prisma/client';
import prisma from '../prisma/prisma';
import {
  Project,
  WbsElementStatus,
  calculateEndDate,
  calculateProjectEndDate,
  calculatePercentExpectedProgress,
  calculateTimelineStatus,
  calculateDuration,
  calculateProjectStartDate
} from 'shared';
import { descBulletConverter, wbsNumOf } from './utils';
import riskQueryArgs from '../prisma-query-args/risks.query-args';
import riskTransformer from '../transformers/risks.transformer';
import { buildChangeDetail } from '../utils/utils';
import { calculateWorkPackageProgress } from './work-packages.utils';
import userTransformer from '../transformers/user.transformer';

/**
 * calculate the project's status based on its workpacakges' status
 * @param proj a given project to be calculated on its status
 * @returns the project's calculated wbs element status as either complete, active, or incomplete
 */
export const calculateProjectStatus = (proj: { workPackages: { wbsElement: { status: WBS_Element_Status } }[] }) => {
  if (proj.workPackages.length === 0) return WbsElementStatus.Inactive;

  if (proj.workPackages.every((wp) => wp.wbsElement.status === WbsElementStatus.Complete)) return WbsElementStatus.Complete;
  else if (proj.workPackages.findIndex((wp) => wp.wbsElement.status === WbsElementStatus.Active) !== -1)
    return WbsElementStatus.Active;
  return WbsElementStatus.Inactive;
};

export const manyRelationArgs = Prisma.validator<Prisma.ProjectArgs>()({
  include: {
    wbsElement: {
      include: {
        projectLead: true,
        projectManager: true,
        changes: { include: { implementer: true } }
      }
    },
    team: true,
    goals: { where: { dateDeleted: null } },
    features: { where: { dateDeleted: null } },
    otherConstraints: { where: { dateDeleted: null } },
    risks: { where: { dateDeleted: null }, ...riskQueryArgs },
    workPackages: {
      where: {
        wbsElement: {
          dateDeleted: null
        }
      },
      include: {
        wbsElement: {
          include: {
            projectLead: true,
            projectManager: true,
            changes: { include: { implementer: true } }
          }
        },
        dependencies: true,
        expectedActivities: true,
        deliverables: true
      }
    }
  }
});

export const uniqueRelationArgs = Prisma.validator<Prisma.WBS_ElementArgs>()({
  include: {
    project: {
      include: {
        team: true,
        goals: { where: { dateDeleted: null } },
        features: { where: { dateDeleted: null } },
        otherConstraints: { where: { dateDeleted: null } },
        risks: { where: { dateDeleted: null }, ...riskQueryArgs },
        workPackages: {
          where: {
            wbsElement: {
              dateDeleted: null
            }
          },
          include: {
            wbsElement: {
              include: {
                projectLead: true,
                projectManager: true,
                changes: { include: { implementer: true } }
              }
            },
            dependencies: true,
            expectedActivities: true,
            deliverables: true
          }
        }
      }
    },
    projectLead: true,
    projectManager: true,
    changes: { include: { implementer: true } }
  }
});

export const projectTransformer = (
  payload: Prisma.ProjectGetPayload<typeof manyRelationArgs> | Prisma.WBS_ElementGetPayload<typeof uniqueRelationArgs>
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
    team,
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
        projectName: wbsElement.name
      };
    })
  };
};

// gets highest current project number
export const getHighestProjectNumber = async (carNumber: number) => {
  const maxProjectNumber = await prisma.wBS_Element.aggregate({
    where: { carNumber },
    _max: { projectNumber: true }
  });

  return maxProjectNumber._max.projectNumber ?? 0;
};

// helper method to add the given description bullets into the database, linked to the given work package
export const addDescriptionBullets = async (addedDetails: string[], id: number, descriptionBulletIdField: string) => {
  // add the added bullets
  if (addedDetails.length > 0) {
    await prisma.description_Bullet.createMany({
      data: addedDetails.map((element) => {
        return {
          detail: element,
          [descriptionBulletIdField]: id
        };
      })
    });
  }
};

// edit descrption bullets in the db for each id and detail pair
export const editDescriptionBullets = async (editedIdsAndDetails: { id: number; detail: string }[]) => {
  if (editedIdsAndDetails.length < 1) return;
  editedIdsAndDetails.forEach(
    async (element) =>
      await prisma.description_Bullet.update({
        where: { descriptionId: element.id },
        data: { detail: element.detail }
      })
  );
};

// create a change json if the old and new value are different, otherwise return undefined
export const createChangeJsonNonList = (
  nameOfField: string,
  oldValue: any,
  newValue: any,
  crId: number,
  implementerId: number,
  wbsElementId: number
) => {
  if (oldValue !== newValue) {
    if (oldValue == null) {
      return {
        changeRequestId: crId,
        implementerId,
        wbsElementId,
        detail: `Added ${nameOfField} "${newValue}"`
      };
    }
    return {
      changeRequestId: crId,
      implementerId,
      wbsElementId,
      detail: buildChangeDetail(nameOfField, oldValue, newValue)
    };
  }
  return undefined;
};

// create a change json list for a given list (rules). Only works if the elements themselves should be compared (strings)
export const createRulesChangesJson = (
  nameOfField: string,
  oldArray: string[],
  newArray: string[],
  crId: number,
  implementerId: number,
  wbsElementId: number
) => {
  const seenOld = new Set<string>(oldArray);
  const seenNew = new Set<string>(newArray);

  const changes: { element: string; type: string }[] = [];

  oldArray.forEach((element) => {
    if (!seenNew.has(element)) {
      changes.push({ element, type: 'Removed' });
    }
  });

  newArray.forEach((element) => {
    if (!seenOld.has(element)) {
      changes.push({ element, type: 'Added new' });
    }
  });
  return changes.map((element) => {
    return {
      changeRequestId: crId,
      implementerId,
      wbsElementId,
      detail: `${element.type} ${nameOfField} "${element.element}"`
    };
  });
};

// Given a user's id, this method returns the user's full name
export const getUserFullName = async (userId: number | null): Promise<string | null> => {
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new Error('user not found');
  return `${user.firstName} ${user.lastName}`;
};
