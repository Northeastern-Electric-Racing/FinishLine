import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import {
  createChangeJsonDates,
  createChangeJsonNonList,
  createDependenciesChangesJson,
  createDescriptionBulletChangesJson,
  getWbsElementId,
  workPackageTransformer,
  wpQueryArgs
} from '../utils/work-packages.utils';
import { isProject, validateWBS, WbsNumber } from 'shared';
import { Role, WBS_Element } from '@prisma/client';
import {
  addDescriptionBullets,
  editDescriptionBullets,
  getChangeRequestReviewState,
  getUserFullName
} from '../utils/projects.utils';
import { descBulletConverter } from '../utils/utils';
import { validationResult } from 'express-validator';

// Fetch all work packages, optionally filtered by query parameters
export const getAllWorkPackages = async (req: Request, res: Response) => {
  const { query } = req;
  const workPackages = await prisma.work_Package.findMany(wpQueryArgs);
  const outputWorkPackages = workPackages.map(workPackageTransformer).filter((wp) => {
    let passes = true;
    if (query.status) passes &&= wp.status === query.status;
    if (query.timelineStatus) passes &&= wp.timelineStatus === query.timelineStatus;
    if (query.daysUntilDeadline) {
      const daysToDeadline = Math.round((wp.endDate.getTime() - new Date().getTime()) / 86400000);
      passes &&= daysToDeadline <= parseInt(query?.daysUntilDeadline as string);
    }
    return passes;
  });
  outputWorkPackages.sort((wpA, wpB) => wpA.endDate.getTime() - wpB.endDate.getTime());
  return res.status(200).json(outputWorkPackages);
};

// Fetch the work package for the specified WBS number
export const getSingleWorkPackage = async (req: Request, res: Response) => {
  const parsedWbs: WbsNumber = validateWBS(req.params.wbsNum);
  if (isProject(parsedWbs)) {
    return res
      .status(400)
      .json({ message: 'WBS Number is a project WBS#, not a Work Package WBS#' });
  }
  const wp = await prisma.work_Package.findFirst({
    where: {
      wbsElement: {
        carNumber: parsedWbs.carNumber,
        projectNumber: parsedWbs.projectNumber,
        workPackageNumber: parsedWbs.workPackageNumber
      }
    },
    ...wpQueryArgs
  });

  if (!wp)
    return res
      .status(404)
      .json({ message: `work package with wbs num ${req.params.wbsNum} not found!` });

  return res.status(200).json(workPackageTransformer(wp));
};

export const createWorkPackage = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const {
    projectWbsNum,
    name,
    crId,
    userId,
    startDate,
    duration,
    dependencies,
    expectedActivities,
    deliverables
  } = body;

  // verify user is allowed to create work packages
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) return res.status(404).json({ message: `user with id #${userId} not found!` });
  if (user.role === Role.GUEST) return res.status(401).json({ message: 'Access Denied' });

  const crReviewed = await getChangeRequestReviewState(crId);
  if (crReviewed === null) {
    return res.status(404).json({ message: `change request with id #${crId} not found!` });
  }
  if (!crReviewed) {
    return res.status(400).json({ message: 'Cannot implement an unreviewed change request' });
  }

  // get the corresponding project so we can find the next wbs number
  // and what number work package this should be
  const { carNumber, projectNumber, workPackageNumber } = projectWbsNum;

  if (workPackageNumber !== 0) throw new TypeError('Given WBS Number is not for a project.');

  const wbsElem = await prisma.wBS_Element.findUnique({
    where: {
      wbsNumber: {
        carNumber,
        projectNumber,
        workPackageNumber
      }
    },
    include: {
      project: {
        include: {
          workPackages: { include: { wbsElement: true, dependencies: true } }
        }
      }
    }
  });

  if (wbsElem === null) {
    return res
      .status(404)
      .json({ message: `Could not find element with wbs number: ${projectWbsNum.toString()}` });
  }

  const { project } = wbsElem;

  if (project === null) {
    return res.status(404).json({ message: `Could not find project from given wbs number!` });
  }
  const { projectId } = project;

  const newWorkPackageNumber: number =
    project.workPackages
      .map((element) => element.wbsElement.workPackageNumber)
      .reduce((prev, curr) => Math.max(prev, curr), 0) + 1;

  const dependenciesWBSElems: (WBS_Element | null)[] = await Promise.all(
    dependencies.map(async (ele: any) => {
      return await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: ele.carNumber,
            projectNumber: ele.projectNumber,
            workPackageNumber: ele.workPackageNumber
          }
        }
      });
    })
  );

  const dependenciesIds = dependenciesWBSElems.map((elem) => {
    if (elem === null) throw new TypeError('One of the dependencies was not found.');
    return elem.wbsElementId;
  });

  // add to the database
  await prisma.work_Package.create({
    data: {
      wbsElement: {
        create: {
          carNumber,
          projectNumber,
          workPackageNumber: newWorkPackageNumber,
          name,
          changes: {
            create: {
              changeRequestId: crId,
              implementerId: userId,
              detail: 'New Work Package Created'
            }
          }
        }
      },
      project: { connect: { projectId } },
      startDate: new Date(startDate),
      duration,
      orderInProject: project.workPackages.length + 1,
      dependencies: { connect: dependenciesIds.map((ele) => ({ wbsElementId: ele })) },
      expectedActivities: { create: expectedActivities.map((ele: string) => ({ detail: ele })) },
      deliverables: { create: deliverables.map((ele: string) => ({ detail: ele })) }
    }
  });

  return res.status(200).json({ message: 'Work Package Created' });
};

export const editWorkPackage = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const {
    workPackageId,
    userId,
    name,
    crId,
    startDate,
    duration,
    dependencies,
    expectedActivities,
    deliverables,
    wbsElementStatus,
    progress,
    projectLead,
    projectManager
  } = body;

  // verify user is allowed to edit work packages
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) return res.status(404).json({ message: `User with id #${userId} not found` });
  if (user.role === Role.GUEST) return res.status(401).json({ message: 'Access Denied' });

  // get the original work package so we can compare things
  const originalWorkPackage = await prisma.work_Package.findUnique({
    where: { workPackageId },
    include: {
      wbsElement: true,
      dependencies: true,
      expectedActivities: true,
      deliverables: true
    }
  });
  if (originalWorkPackage === null) {
    return res.status(404).json({ message: `Work Package with id #${workPackageId} not found` });
  }

  // the crId must match a valid approved change request
  const changeRequest = await prisma.change_Request.findUnique({ where: { crId } });
  if (changeRequest === null) {
    return res.status(404).json({ message: `Change request with id #${crId} not found` });
  }
  if (!changeRequest.accepted) {
    return res.status(400).json({ message: 'Cannot implement an unreviewed change request' });
  }

  const depsIds: (number | undefined)[] = await Promise.all(
    dependencies.map(async (wbsNum: any) => getWbsElementId(wbsNum))
  );
  if (depsIds.includes(undefined)) {
    return res.status(404).json({ message: `Dependency with wbs number ${depsIds} not found` });
  }

  const { wbsElementId } = originalWorkPackage;
  let changes = [];
  // get the changes or undefined for each of the fields
  const nameChangeJson = createChangeJsonNonList(
    'name',
    originalWorkPackage.wbsElement.name,
    name,
    crId,
    userId,
    wbsElementId!
  );
  const startDateChangeJson = createChangeJsonDates(
    'start date',
    originalWorkPackage.startDate,
    new Date(startDate),
    crId,
    userId,
    wbsElementId!
  );
  const durationChangeJson = createChangeJsonNonList(
    'duration',
    originalWorkPackage.duration,
    duration,
    crId,
    userId,
    wbsElementId!
  );
  const progressChangeJson = createChangeJsonNonList(
    'progress',
    originalWorkPackage.progress,
    progress,
    crId,
    userId,
    wbsElementId!
  );
  const wbsElementStatusChangeJson = createChangeJsonNonList(
    'status',
    originalWorkPackage.wbsElement.status,
    wbsElementStatus,
    crId,
    userId,
    wbsElementId!
  );
  const dependenciesChangeJson = await createDependenciesChangesJson(
    originalWorkPackage.dependencies.map((element) => element.wbsElementId),
    depsIds.map((elem) => elem as number),
    crId,
    userId,
    wbsElementId!,
    'dependency'
  );
  const expectedActivitiesChangeJson = createDescriptionBulletChangesJson(
    originalWorkPackage.expectedActivities
      .filter((ele) => !ele.dateDeleted)
      .map((element) => descBulletConverter(element)),
    expectedActivities,
    crId,
    userId,
    wbsElementId!,
    'expected activity'
  );
  const deliverablesChangeJson = createDescriptionBulletChangesJson(
    originalWorkPackage.deliverables
      .filter((ele) => !ele.dateDeleted)
      .map((element) => descBulletConverter(element)),
    deliverables,
    crId,
    userId,
    wbsElementId!,
    'deliverable'
  );

  // add to changes if not undefined
  if (nameChangeJson !== undefined) {
    changes.push(nameChangeJson);
  }
  if (startDateChangeJson !== undefined) {
    changes.push(startDateChangeJson);
  }
  if (durationChangeJson !== undefined) {
    changes.push(durationChangeJson);
  }
  if (progressChangeJson !== undefined) {
    changes.push(progressChangeJson);
  }
  if (wbsElementStatusChangeJson !== undefined) {
    changes.push(wbsElementStatusChangeJson);
  }

  if (body.hasOwnProperty('projectManager')) {
    const projectManagerChangeJson = createChangeJsonNonList(
      'project manager',
      await getUserFullName(originalWorkPackage.wbsElement.projectManagerId),
      await getUserFullName(body.projectManager),
      crId,
      userId,
      wbsElementId!
    );
    if (projectManagerChangeJson) {
      changes.push(projectManagerChangeJson);
    }
  }

  if (body.hasOwnProperty('projectLead')) {
    const projectLeadChangeJson = createChangeJsonNonList(
      'project lead',
      await getUserFullName(originalWorkPackage.wbsElement.projectLeadId),
      await getUserFullName(body.projectLead),
      crId,
      userId,
      wbsElementId!
    );
    if (projectLeadChangeJson) {
      changes.push(projectLeadChangeJson);
    }
  }

  // add the changes for each of dependencies, expected activities, and deliverables
  changes = changes
    .concat(dependenciesChangeJson)
    .concat(expectedActivitiesChangeJson.changes)
    .concat(deliverablesChangeJson.changes);

  // update the work package with the input fields
  const updatedWorkPackage = await prisma.work_Package.update({
    where: { wbsElementId },
    data: {
      startDate: new Date(startDate),
      duration,
      progress,
      wbsElement: {
        update: {
          name,
          status: wbsElementStatus,
          projectLeadId: projectLead,
          projectManagerId: projectManager
        }
      },
      dependencies: {
        set: [], // remove all the connections then add all the given ones
        connect: depsIds.map((ele) => ({ wbsElementId: ele }))
      }
    }
  });

  // Update any deleted description bullets to have their date deleted as right now
  const deletedIds = expectedActivitiesChangeJson.deletedIds.concat(
    deliverablesChangeJson.deletedIds
  );
  if (deletedIds.length > 0) {
    await prisma.description_Bullet.updateMany({
      where: { descriptionId: { in: deletedIds } },
      data: { dateDeleted: new Date() }
    });
  }

  addDescriptionBullets(
    expectedActivitiesChangeJson.addedDetails,
    updatedWorkPackage.workPackageId,
    'workPackageIdExpectedActivities'
  );
  addDescriptionBullets(
    deliverablesChangeJson.addedDetails,
    updatedWorkPackage.workPackageId,
    'workPackageIdDeliverables'
  );
  editDescriptionBullets(
    expectedActivitiesChangeJson.editedIdsAndDetails.concat(
      deliverablesChangeJson.editedIdsAndDetails
    )
  );

  // create the changes in prisma
  await prisma.change.createMany({ data: changes });

  // return the updated work package
  return res.status(200).json({ message: 'Work package updated successfully' });
};
