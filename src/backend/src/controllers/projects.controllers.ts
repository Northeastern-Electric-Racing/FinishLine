import prisma from '../prisma/prisma';
import { isProject, validateWBS, WbsNumber } from 'shared';
import {
  addDescriptionBullets,
  createChangeJsonNonList,
  createDescriptionBulletChangesJson,
  createRulesChangesJson,
  editDescriptionBullets,
  getChangeRequestReviewState,
  getHighestProjectNumber,
  getUserFullName,
  manyRelationArgs,
  projectTransformer,
  uniqueRelationArgs
} from '../utils/projects.utils';
import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { validationResult } from 'express-validator';
import { descBulletConverter } from '../utils/utils';

export const getAllProjects = async (_req: Request, res: Response) => {
  const projects = await prisma.project.findMany(manyRelationArgs);
  res.status(200).json(projects.map(projectTransformer));
};

export const getSingleProject = async (req: Request, res: Response) => {
  const parsedWbs: WbsNumber = validateWBS(req.params.wbsNum);

  if (!isProject(parsedWbs)) {
    return res.status(404).json({ message: `${req.params.wbsNum} is not a valid project WBS #!` });
  }

  const wbsEle = await prisma.wBS_Element.findUnique({
    where: {
      wbsNumber: {
        carNumber: parsedWbs.carNumber,
        projectNumber: parsedWbs.projectNumber,
        workPackageNumber: parsedWbs.workPackageNumber
      }
    },
    ...uniqueRelationArgs
  });

  if (wbsEle === null) {
    return res.status(404).json({ message: `project ${req.params.wbsNum} not found!` });
  }

  return res.status(200).json(projectTransformer(wbsEle));
};

export const newProject = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // verify user is allowed to create projects
  const user = await prisma.user.findUnique({ where: { userId: req.body.userId } });
  if (!user) return res.status(404).json({ message: `user #${req.body.userId} not found!` });
  if (user.role === Role.GUEST) return res.status(401).json({ message: 'Access Denied' });

  // check if the change request exists
  const crReviewed = await getChangeRequestReviewState(req.body.crId);
  if (crReviewed === null) {
    return res.status(404).json({ message: `change request CR #${req.body.crId}` });
  }
  if (!crReviewed) {
    return res.status(400).json({ message: 'Cannot implement an unreviewed change request' });
  }

  // create the wbs element for the project and document the implemented change request
  const maxProjectNumber = await getHighestProjectNumber(req.body.carNumber);
  const createdProject = await prisma.wBS_Element.create({
    data: {
      carNumber: req.body.carNumber,
      projectNumber: maxProjectNumber + 1,
      workPackageNumber: 0,
      name: req.body.name,
      project: { create: { summary: req.body.summary } },
      changes: {
        create: {
          changeRequestId: req.body.crId,
          implementerId: req.body.userId,
          detail: 'New Project Created'
        }
      }
    },
    include: { project: true, changes: true }
  });

  return res.status(200).json({
    wbsNumber: {
      carNumber: createdProject.carNumber,
      projectNumber: createdProject.projectNumber,
      workPackageNumber: createdProject.workPackageNumber
    }
  });
};

export const editProject = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const {
    projectId,
    crId,
    userId,
    budget,
    summary,
    rules,
    goals,
    features,
    otherConstraints,
    name,
    wbsElementStatus
  } = body;

  // Create optional arg values
  const googleDriveFolderLink =
    body.googleDriveFolderLink === undefined ? null : body.googleDriveFolderLink;
  const slideDeckLink = body.slideDeckLink === undefined ? null : body.slideDeckLink;
  const bomLink = body.bomLink === undefined ? null : body.bomLink;
  const taskListLink = body.taskListLink === undefined ? null : body.taskListLink;
  const projectLead = body.projectLead === undefined ? null : body.projectLead;
  const projectManager = body.projectManager === undefined ? null : body.projectManager;

  // verify user is allowed to edit projects
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) return res.status(404).json({ message: `user with id ${userId} not found` });
  if (user.role === Role.GUEST) return res.status(401).json({ message: 'Access Denied' });
  // Verify valid change request
  const crReviewed = await getChangeRequestReviewState(body.crId);
  if (crReviewed === null)
    return res.status(404).json({ message: `change request with id ${crId} not found` });
  if (!crReviewed) {
    return res.status(400).json({ message: 'Cannot implement an unreviewed change request' });
  }

  // get the original project so we can compare things
  const originalProject = await prisma.project.findUnique({
    where: {
      projectId
    },
    include: {
      wbsElement: true,
      goals: true,
      features: true,
      otherConstraints: true
    }
  });

  // if it doesn't exist we error
  if (originalProject === null) {
    return res.status(404).json({ message: `project ${projectId} not found!` });
  }

  const { wbsElementId } = originalProject;

  let changes = [];
  // get the changes or undefined for each field and add it to changes
  const nameChangeJson = createChangeJsonNonList(
    'name',
    originalProject.wbsElement.name,
    name,
    crId,
    userId,
    wbsElementId
  );
  const budgetChangeJson = createChangeJsonNonList(
    'budget',
    originalProject.budget,
    budget,
    crId,
    userId,
    wbsElementId
  );
  const summaryChangeJson = createChangeJsonNonList(
    'summary',
    originalProject.summary,
    summary,
    crId,
    userId,
    wbsElementId
  );
  const statusChangeJson = createChangeJsonNonList(
    'status',
    originalProject.wbsElement.status,
    wbsElementStatus,
    crId,
    userId,
    wbsElementId
  );
  const driveChangeJson = createChangeJsonNonList(
    'google drive folder link',
    originalProject.googleDriveFolderLink,
    googleDriveFolderLink,
    crId,
    userId,
    wbsElementId
  );
  const slideChangeJson = createChangeJsonNonList(
    'slide deck link',
    originalProject.slideDeckLink,
    slideDeckLink,
    crId,
    userId,
    wbsElementId
  );
  const bomChangeJson = createChangeJsonNonList(
    'bom link',
    originalProject.bomLink,
    bomLink,
    crId,
    userId,
    wbsElementId
  );
  const taskChangeJson = createChangeJsonNonList(
    'task list link',
    originalProject.taskListLink,
    taskListLink,
    crId,
    userId,
    wbsElementId
  );
  const projectManagerChangeJson = createChangeJsonNonList(
    'project manager',
    await getUserFullName(originalProject.wbsElement.projectManagerId),
    await getUserFullName(projectManager),
    crId,
    userId,
    wbsElementId
  );
  const projectLeadChangeJson = createChangeJsonNonList(
    'project lead',
    await getUserFullName(originalProject.wbsElement.projectLeadId),
    await getUserFullName(projectLead),
    crId,
    userId,
    wbsElementId
  );
  // add to changes if not undefined
  if (nameChangeJson !== undefined) {
    changes.push(nameChangeJson);
  }
  if (budgetChangeJson !== undefined) {
    changes.push(budgetChangeJson);
  }
  if (summaryChangeJson !== undefined) {
    changes.push(summaryChangeJson);
  }
  if (statusChangeJson !== undefined) {
    changes.push(statusChangeJson);
  }
  if (driveChangeJson !== undefined) {
    changes.push(driveChangeJson);
  }
  if (slideChangeJson !== undefined) {
    changes.push(slideChangeJson);
  }
  if (bomChangeJson !== undefined) {
    changes.push(bomChangeJson);
  }
  if (taskChangeJson !== undefined) {
    changes.push(taskChangeJson);
  }
  if (projectManagerChangeJson !== undefined) {
    changes.push(projectManagerChangeJson);
  }
  if (projectLeadChangeJson !== undefined) {
    changes.push(projectLeadChangeJson);
  }

  // Dealing with lists
  const rulesChangeJson = createRulesChangesJson(
    'rules',
    originalProject.rules,
    rules,
    crId,
    userId,
    wbsElementId
  );
  const goalsChangeJson = createDescriptionBulletChangesJson(
    originalProject.goals
      .filter((element) => !element.dateDeleted)
      .map((element) => descBulletConverter(element)),
    goals,
    crId,
    userId,
    wbsElementId,
    'goals'
  );
  const featuresChangeJson = createDescriptionBulletChangesJson(
    originalProject.features
      .filter((element) => !element.dateDeleted)
      .map((element) => descBulletConverter(element)),
    features,
    crId,
    userId,
    wbsElementId,
    'features'
  );
  const otherConstraintsChangeJson = createDescriptionBulletChangesJson(
    originalProject.otherConstraints
      .filter((element) => !element.dateDeleted)
      .map((element) => descBulletConverter(element)),
    otherConstraints,
    crId,
    userId,
    wbsElementId,
    'other constraints'
  );
  // add the changes for each of dependencies, expected activities, and deliverables
  changes = changes
    .concat(rulesChangeJson)
    .concat(goalsChangeJson.changes)
    .concat(featuresChangeJson.changes)
    .concat(otherConstraintsChangeJson.changes);

  // update the project with the input fields
  const updatedProject = await prisma.project.update({
    where: {
      wbsElementId
    },
    data: {
      budget,
      summary,
      googleDriveFolderLink,
      slideDeckLink,
      bomLink,
      taskListLink,
      rules,
      wbsElement: {
        update: {
          name,
          status: wbsElementStatus,
          projectLeadId: projectLead,
          projectManagerId: projectManager
        }
      }
    }
  });

  // Update any deleted description bullets to have their date deleted as right now
  const deletedIds = goalsChangeJson.deletedIds
    .concat(featuresChangeJson.deletedIds)
    .concat(otherConstraintsChangeJson.deletedIds);
  if (deletedIds.length > 0) {
    await prisma.description_Bullet.updateMany({
      where: {
        descriptionId: {
          in: deletedIds
        }
      },
      data: {
        dateDeleted: new Date()
      }
    });
  }
  addDescriptionBullets(goalsChangeJson.addedDetails, updatedProject.projectId, 'projectIdGoals');
  addDescriptionBullets(
    featuresChangeJson.addedDetails,
    updatedProject.projectId,
    'projectIdFeatures'
  );
  addDescriptionBullets(
    otherConstraintsChangeJson.addedDetails,
    updatedProject.projectId,
    'projectIdOtherConstraints'
  );
  editDescriptionBullets(
    goalsChangeJson.editedIdsAndDetails
      .concat(featuresChangeJson.editedIdsAndDetails)
      .concat(otherConstraintsChangeJson.editedIdsAndDetails)
  );
  // create the changes in prisma
  await prisma.change.createMany({
    data: changes
  });

  // return the updated work package
  return res.status(200).json(updatedProject);
};
