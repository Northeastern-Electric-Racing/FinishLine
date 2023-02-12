import { Role, User } from '@prisma/client';
import prisma from '../prisma/prisma';
import { isProject, Project, WbsNumber, DescriptionBullet } from 'shared';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import teamQueryArgs from '../prisma-query-args/teams.query-args';
import projectTransformer from '../transformers/projects.transformer';
import { AccessDeniedException, HttpException, NotFoundException } from '../utils/errors.utils';
import { validateChangeRequestAccepted } from '../utils/change-requests.utils';
import {
  getHighestProjectNumber,
  createChangeJsonNonList,
  addDescriptionBullets,
  editDescriptionBullets
} from '../utils/projects.utils';
import { getUserFullName, createRulesChangesJson, createDescriptionBulletChangesJson } from '../utils/projects.utils';
import { descBulletConverter } from '../utils/utils';

export default class ProjectsService {
  static async getAllProjects(): Promise<Project[]> {
    const projects = await prisma.project.findMany({ where: { wbsElement: { dateDeleted: null } }, ...projectQueryArgs });
    return projects.map(projectTransformer);
  }

  static async getSingleProject(parsedWbs: WbsNumber): Promise<Project> {
    if (!isProject(parsedWbs)) {
      throw new HttpException(
        404,
        'WBS Number ' +
          `${parsedWbs.carNumber}.${parsedWbs.projectNumber}.${parsedWbs.workPackageNumber}` +
          'is not a valid project WBS #!'
      );
    }

    // I DON'T GET THIS PART
    const { carNumber, projectNumber, workPackageNumber } = parsedWbs;

    const project = await prisma.project.findFirst({
      where: {
        wbsElement: {
          carNumber,
          projectNumber,
          workPackageNumber
        }
      },
      ...projectQueryArgs
    });

    if (!project)
      throw new NotFoundException(
        'Project',
        `${parsedWbs.carNumber}.${parsedWbs.projectNumber}.${parsedWbs.workPackageNumber}`
      );

    if (project.wbsElement.dateDeleted) throw new AccessDeniedException('This project has been deleted!');

    return projectTransformer(project);
  }
  static async createProject(
    user: User,
    teamId: string,
    carNumber: number,
    name: string,
    summary: string,
    crId: number
  ): Promise<string> {
    const { userId } = user;
    // verify user is allowed to create projects
    if (user.role === Role.GUEST) throw new AccessDeniedException();

    await validateChangeRequestAccepted(crId);

    // DUPLICATE CODE
    if (teamId !== undefined) {
      const team = await prisma.team.findUnique({ where: { teamId }, ...teamQueryArgs });
      if (!team) {
        throw new NotFoundException('Team', teamId);
      }
    }

    // create the wbs element for the project and document the implemented change request
    const maxProjectNumber = await getHighestProjectNumber(carNumber);
    const createdProject = await prisma.wBS_Element.create({
      data: {
        carNumber,
        projectNumber: maxProjectNumber + 1,
        workPackageNumber: 0,
        name,
        project: {
          create: {
            summary,
            teamId
          }
        },
        changes: {
          create: {
            changeRequestId: crId,
            implementerId: userId,
            detail: 'New Project Created'
          }
        }
      },
      include: { project: true, changes: true }
    });

    return `${createdProject.carNumber}.${createdProject.projectNumber}.${createdProject.workPackageNumber}`;
  }

  static async editProject(
    user: User,
    projectId: number,
    crId: number,
    userId: number,
    budget: number,
    summary: string,
    rules: string[],
    goals: DescriptionBullet[],
    features: DescriptionBullet[],
    otherConstraints: DescriptionBullet[],
    // DON'T GET THIS PART
    name: string,
    googleDriveFolderLink: string | null,
    slideDeckLink: string | null,
    bomLink: string | null,
    taskListLink: string | null,
    // WHY IS IT A NUMBER
    projectLead: number | null,
    projectManager: number | null
  ): Promise<void> {
    // verify user is allowed to edit projects
    if (user.role === Role.GUEST) throw new AccessDeniedException();

    // verify valid change request
    await validateChangeRequestAccepted(crId);

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
    if (!originalProject) throw new NotFoundException('Project', projectId);
    if (originalProject.wbsElement.dateDeleted) throw new HttpException(400, 'Cannot edit a deleted project!');

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
    const budgetChangeJson = createChangeJsonNonList('budget', originalProject.budget, budget, crId, userId, wbsElementId);
    const summaryChangeJson = createChangeJsonNonList(
      'summary',
      originalProject.summary,
      summary,
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
    const bomChangeJson = createChangeJsonNonList('bom link', originalProject.bomLink, bomLink, crId, userId, wbsElementId);
    const taskChangeJson = createChangeJsonNonList(
      'task list link',
      originalProject.taskListLink,
      taskListLink,
      crId,
      userId,
      wbsElementId
    );

    // SHOULD I USE GETUSERFULLNAME AND ALSO IS THE INPUT CORRECT?
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
    const rulesChangeJson = createRulesChangesJson('rules', originalProject.rules, rules, crId, userId, wbsElementId);
    const goalsChangeJson = createDescriptionBulletChangesJson(
      originalProject.goals.filter((element) => !element.dateDeleted).map((element) => descBulletConverter(element)),
      goals,
      crId,
      userId,
      wbsElementId,
      'goals'
    );
    const featuresChangeJson = createDescriptionBulletChangesJson(
      originalProject.features.filter((element) => !element.dateDeleted).map((element) => descBulletConverter(element)),
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
            projectLeadId: projectLead,
            projectManagerId: projectManager
          }
        }
      },
      ...projectQueryArgs
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
    addDescriptionBullets(featuresChangeJson.addedDetails, updatedProject.projectId, 'projectIdFeatures');
    addDescriptionBullets(otherConstraintsChangeJson.addedDetails, updatedProject.projectId, 'projectIdOtherConstraints');
    editDescriptionBullets(
      goalsChangeJson.editedIdsAndDetails
        .concat(featuresChangeJson.editedIdsAndDetails)
        .concat(otherConstraintsChangeJson.editedIdsAndDetails)
    );

    // create the changes in prisma
    await prisma.change.createMany({
      data: changes
    });
  }
  static async setProjectTeam(parsedWbs: WbsNumber, teamId: string, user: User): Promise<Project> {
    if (!isProject(parsedWbs)) {
      throw new HttpException(
        404,
        'WBS Number ' +
          `${parsedWbs.carNumber}.${parsedWbs.projectNumber}.${parsedWbs.workPackageNumber}` +
          'is not a valid project WBS #!'
      );
    }

    // find the associated project
    const project = await prisma.project.findFirst({
      where: {
        wbsElement: {
          carNumber: parsedWbs.carNumber,
          projectNumber: parsedWbs.projectNumber,
          workPackageNumber: parsedWbs.workPackageNumber
        }
      },
      ...projectQueryArgs
    });

    if (!project) {
      throw new NotFoundException(
        'Project',
        `${parsedWbs.carNumber}.${parsedWbs.projectNumber}.${parsedWbs.workPackageNumber}`
      );
    }

    // check for valid team
    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) {
      throw new NotFoundException('Team', teamId);
    }

    // check for user and user permission (admin, app admin, or leader of the team)
    if (
      user.role === Role.GUEST ||
      user.role === Role.MEMBER ||
      (user.role === Role.LEADERSHIP && user.userId !== team.leaderId)
    ) {
      throw new AccessDeniedException('you must be an admin or the team lead to update the team!');
    }

    // if everything is fine, then update the given project to assign to provided team ID
    await prisma.project.update({
      where: { projectId: project.projectId },
      data: { teamId }
    });

    return projectTransformer(project);
  }
}
