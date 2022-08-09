import { Prisma } from '@prisma/client';
import prisma from '../prisma/prisma';
import {
  Project,
  WbsElementStatus,
  DescriptionBullet,
  calculateEndDate,
  calculatePercentExpectedProgress,
  calculateTimelineStatus
} from 'shared';
import { descBulletConverter, wbsNumOf } from './utils';

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
    goals: true,
    features: true,
    otherConstraints: true,
    workPackages: {
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
        goals: true,
        features: true,
        otherConstraints: true,
        workPackages: {
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
  payload:
    | Prisma.ProjectGetPayload<typeof manyRelationArgs>
    | Prisma.WBS_ElementGetPayload<typeof uniqueRelationArgs>
): Project => {
  if (payload === null) throw new TypeError('WBS_Element not found');
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
    status: wbsElement.status as WbsElementStatus,
    projectLead: projectLead ?? undefined,
    projectManager: projectManager ?? undefined,
    changes: wbsElement.changes.map((change) => ({
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      wbsNum,
      implementer: change.implementer,
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
    duration: project.workPackages.reduce((prev, curr) => prev + curr.duration, 0),
    goals: project.goals.map(descBulletConverter),
    features: project.features.map(descBulletConverter),
    otherConstraints: project.otherConstraints.map(descBulletConverter),
    workPackages: project.workPackages.map((workPackage) => {
      const endDate = calculateEndDate(workPackage.startDate, workPackage.duration);
      const expectedProgress = calculatePercentExpectedProgress(
        workPackage.startDate,
        workPackage.duration,
        wbsElement.status
      );

      return {
        id: workPackage.workPackageId,
        wbsNum: wbsNumOf(workPackage.wbsElement),
        dateCreated: workPackage.wbsElement.dateCreated,
        name: workPackage.wbsElement.name,
        status: workPackage.wbsElement.status as WbsElementStatus,
        projectLead: workPackage.wbsElement.projectLead ?? undefined,
        projectManager: workPackage.wbsElement.projectManager ?? undefined,
        changes: workPackage.wbsElement.changes.map((change) => ({
          changeId: change.changeId,
          changeRequestId: change.changeRequestId,
          wbsNum: wbsNumOf(workPackage.wbsElement),
          implementer: change.implementer,
          detail: change.detail,
          dateImplemented: change.dateImplemented
        })),
        orderInProject: workPackage.orderInProject,
        progress: workPackage.progress,
        startDate: workPackage.startDate,
        endDate,
        duration: workPackage.duration,
        expectedProgress,
        timelineStatus: calculateTimelineStatus(workPackage.progress, expectedProgress),
        dependencies: workPackage.dependencies.map(wbsNumOf),
        expectedActivities: workPackage.expectedActivities.map(descBulletConverter),
        deliverables: workPackage.deliverables.map(descBulletConverter)
      };
    })
  };
};

// gets the associated change request for creating a project
export const getChangeRequestReviewState = async (crId: number) => {
  const cr = await prisma.change_Request.findUnique({ where: { crId } });

  // returns null if the change request doesn't exist
  // if it exists, return a boolean describing if the change request was reviewed
  return cr ? cr.dateReviewed !== null : cr;
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
export const addDescriptionBullets = async (
  addedDetails: string[],
  id: number,
  descriptionBulletIdField: string
) => {
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
export const editDescriptionBullets = async (
  editedIdsAndDetails: { id: number; detail: string }[]
) => {
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
      detail: `Edited ${nameOfField} from "${oldValue}" to "${newValue}"`
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

// this method creates changes for description bullet inputs
// it returns it as an object of {deletedIds[], addedDetails[] changes[]}
// because the deletedIds are needed for the database and the addedDetails are needed to make new ones
export const createDescriptionBulletChangesJson = (
  oldArray: DescriptionBullet[],
  newArray: DescriptionBullet[],
  crId: number,
  implementerId: number,
  wbsElementId: number,
  nameOfField: string
): {
  deletedIds: number[];
  addedDetails: string[];
  editedIdsAndDetails: { id: number; detail: string }[];
  changes: {
    changeRequestId: number;
    implementerId: number;
    wbsElementId: number;
    detail: string;
  }[];
} => {
  // Changes
  const changes: { element: DescriptionBullet; type: string }[] = [];

  // Elements from database that have not been deleted
  const oldArrayNotDeleted = oldArray.filter((element) => element.dateDeleted === undefined);

  // All elements that were inputs but are not new
  const existingElements = new Map<number, string>();

  // Database version of edited elements
  const originalElements = new Map<number, string>();

  // Find new elements
  newArray.forEach((element) => {
    if (element.id === undefined) {
      changes.push({ element, type: 'Added new' });
    } else {
      existingElements.set(element.id, element.detail);
    }
  });

  // Find deleted and edited
  oldArrayNotDeleted.forEach((element) => {
    // Input version of old description element text
    const inputElText = existingElements.get(element.id);

    if (inputElText === undefined) {
      changes.push({ element, type: 'Removed' });
    } else if (inputElText !== element.detail) {
      changes.push({ element: { ...element, detail: inputElText }, type: 'Edited' });
      originalElements.set(element.id, element.detail);
    }
  });

  return {
    deletedIds: changes
      .filter((element) => element.type === 'Removed')
      .map((element) => {
        return element.element.id;
      }),
    addedDetails: changes
      .filter((element) => element.type === 'Added new')
      .map((element) => {
        return element.element.detail;
      }),
    editedIdsAndDetails: changes
      .filter((element) => element.type === 'Edited')
      .map((element) => {
        return { id: element.element.id, detail: element.element.detail };
      }),
    changes: changes.map((element) => {
      const detail =
        element.type === 'Edited'
          ? `${element.type} ${nameOfField} from "${originalElements.get(
              element.element.id
            )}" to "${existingElements.get(element.element.id)}"`
          : `${element.type} ${nameOfField} "${element.element.detail}"`;
      return {
        changeRequestId: crId,
        implementerId,
        wbsElementId,
        detail
      };
    })
  };
};

// Given a user's id, this method returns the user's full name
export const getUserFullName = async (userId: number | null): Promise<string | null> => {
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new Error('user not found');
  return `${user.firstName} ${user.lastName}`;
};
