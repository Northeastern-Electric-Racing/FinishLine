import { Role, User } from '@prisma/client';
import { isProject, Project, WbsNumber, wbsPipe } from 'shared';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import prisma from '../prisma/prisma';
import projectTransformer from '../transformers/projects.transformer';
import { validateChangeRequestAccepted } from '../utils/change-requests.utils';
import { AccessDeniedException, HttpException, NotFoundException } from '../utils/errors.utils';
import {
  addDescriptionBullets,
  createChangeJsonNonList,
  createRulesChangesJson,
  editDescriptionBullets,
  getHighestProjectNumber,
  getUserFullName
} from '../utils/projects.utils';
import { descBulletConverter, wbsNumOf } from '../utils/utils';
import { createDescriptionBulletChangesJson } from '../utils/work-packages.utils';
import WorkPackagesService from './work-packages.services';

export default class ProjectsService {
  /**
   * Delete the the project in the database along with all its work packages.
   * @returns the project that is deleted.
   */
  static async deleteProject(user: User, _wbsNumber: WbsNumber): Promise<WbsNumber> {
    if (!isProject(_wbsNumber)) throw new HttpException(400, `${wbsPipe(_wbsNumber)} is not a valid project WBS #!`);
    if (user.role === Role.GUEST || user.role === Role.LEADERSHIP || user.role === Role.MEMBER) {
      throw new AccessDeniedException('Guests, Members, and Leadership cannot delete projects');
    }

    const deletedProject = await prisma.wBS_Element.delete({
      where: {
        wbsNumber: _wbsNumber
      }
    });

    // const wbsNumbersForAllWorkPackages = await WorkPackagesService.getAllWorkPackages({});
    // wbsNumbersForAllWorkPackages.map((eachWP) => WorkPackagesService.deleteWorkPackage(eachWP));
    return deletedProject;
  }

  /**
   * Get all the projects in the database.
   * @returns all the projects
   */
  static async getAllProjects(): Promise<Project[]> {
    const projects = await prisma.project.findMany({ where: { wbsElement: { dateDeleted: null } }, ...projectQueryArgs });
    return projects.map(projectTransformer);
  }

  /**
   * Get a single project
   * @param wbsNumber the wbsNumber of the project to get
   * @returns the request project
   * @throws if the wbsNumber is invalid, the project is not found, or the project is deleted
   */
  static async getSingleProject(wbsNumber: WbsNumber): Promise<Project> {
    if (!isProject(wbsNumber)) throw new HttpException(400, `${wbsPipe(wbsNumber)} is not a valid project WBS #!`);

    const { carNumber, projectNumber, workPackageNumber } = wbsNumber;

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

    if (!project) throw new NotFoundException('Project', wbsPipe(wbsNumber));
    if (project.wbsElement.dateDeleted) throw new HttpException(400, 'This project has been deleted!');

    return projectTransformer(project);
  }

  /**
   * Create a new project with the given information.
   * @param user the user creating the project
   * @param crId the change request id being used to create the project
   * @param carNumber the car number of the new project
   * @param name the name of the new project
   * @param summary the summary of the new project
   * @param teamId the teamId of the new project
   * @returns the wbs number of the created project
   * @throws if the user doesn't have permission or if the change request is invalid
   */
  static async createProject(
    user: User,
    crId: number,
    carNumber: number,
    name: string,
    summary: string,
    teamId: string | undefined
  ): Promise<WbsNumber> {
    if (user.role === Role.GUEST) throw new AccessDeniedException('Guests cannot create projects');

    await validateChangeRequestAccepted(crId);

    if (teamId) {
      const team = await prisma.team.findUnique({ where: { teamId } });
      if (!team) throw new NotFoundException('Team', teamId);
    }

    const maxProjectNumber: number = await getHighestProjectNumber(carNumber);

    // create the wbs element and project as well as the associated change
    const createdWbsElement = await prisma.wBS_Element.create({
      data: {
        carNumber,
        projectNumber: maxProjectNumber + 1,
        workPackageNumber: 0,
        name,
        project: { create: { summary, teamId } },
        changes: {
          create: {
            changeRequestId: crId,
            implementerId: user.userId,
            detail: 'New Project Created'
          }
        }
      },
      include: { project: true, changes: true }
    });

    return wbsNumOf(createdWbsElement);
  }

  /**
   * Edits the given project with the given information.
   * @param user the user editing the project
   * @param projectId the id of the project to edit
   * @param crId the change request used to do the editing
   * @param name the new name of the project
   * @param budget the new budget of the project
   * @param summary the new summary of the project
   * @param rules the new rules of the project
   * @param goals the new goals of the project
   * @param features the new features of the project
   * @param otherConstraints the new otherConstraints of the project
   * @param googleDriveFolderLink the new googleDriveFolderLink of the project
   * @param slideDeckLink the new slideDeckLink of the project
   * @param bomLink the new bomLink of the project
   * @param taskListLink the new taskListLink of the project
   * @param projectLeadId the new projectLead of the project
   * @param projectManagerId the new projectManager of the project
   * @returns the edited project
   */
  static async editProject(
    user: User,
    projectId: number,
    crId: number,
    name: string,
    budget: number,
    summary: string,
    rules: string[],
    goals: { id: number; detail: string }[],
    features: { id: number; detail: string }[],
    otherConstraints: { id: number; detail: string }[],
    googleDriveFolderLink: string | null,
    slideDeckLink: string | null,
    bomLink: string | null,
    taskListLink: string | null,
    projectLeadId: number | null,
    projectManagerId: number | null
  ): Promise<Project> {
    if (user.role === Role.GUEST) throw new AccessDeniedException('Guests cannot edit projects');
    const { userId } = user;

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
    if (originalProject.wbsElement.dateDeleted) throw new HttpException(400, 'This project has been deleted!');

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
    const projectManagerChangeJson = createChangeJsonNonList(
      'project manager',
      await getUserFullName(originalProject.wbsElement.projectManagerId),
      await getUserFullName(projectManagerId),
      crId,
      userId,
      wbsElementId
    );
    const projectLeadChangeJson = createChangeJsonNonList(
      'project lead',
      await getUserFullName(originalProject.wbsElement.projectLeadId),
      await getUserFullName(projectLeadId),
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
            projectLeadId,
            projectManagerId
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

    // return the updated work package
    return projectTransformer(updatedProject);
  }

  /**
   * Sets the given project's team to be the given project.
   * @param user the user doing the setting
   * @param wbsNumber the wbsNumber of the project
   * @param teamId the teamId to assign the project to
   * @throws if the project isn't found, the team isn't found, or the user doesn't have access
   */
  static async setProjectTeam(user: User, wbsNumber: WbsNumber, teamId: string): Promise<void> {
    if (!isProject(wbsNumber)) throw new HttpException(400, `${wbsPipe(wbsNumber)} is not a valid project WBS #!`);

    // find the associated project
    const project = await prisma.project.findFirst({
      where: {
        wbsElement: {
          carNumber: wbsNumber.carNumber,
          projectNumber: wbsNumber.projectNumber,
          workPackageNumber: wbsNumber.workPackageNumber
        }
      }
    });

    if (!project) throw new NotFoundException('Project', wbsPipe(wbsNumber));

    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) throw new NotFoundException('Team', teamId);

    // check for user and user permission (admin, app admin, or leader of the team)
    if (user.role !== Role.ADMIN && user.role !== Role.APP_ADMIN && user.userId !== team.leaderId) {
      throw new AccessDeniedException();
    }

    // if everything is fine, then update the given project to assign to provided team ID
    await prisma.project.update({
      where: { projectId: project.projectId },
      data: { teamId }
    });

    return;
  }
}
