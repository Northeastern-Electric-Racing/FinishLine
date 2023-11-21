import { User } from '@prisma/client';
import { isAdmin, isGuest, isProject, LinkCreateArgs, LinkType, Project, WbsNumber, wbsPipe } from 'shared';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import prisma from '../prisma/prisma';
import projectTransformer from '../transformers/projects.transformer';
import { validateChangeRequestAccepted } from '../utils/change-requests.utils';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedGuestException,
  HttpException,
  NotFoundException,
  DeletedException
} from '../utils/errors.utils';
import { updateProjectAndCreateChanges, getHighestProjectNumber } from '../utils/projects.utils';
import { wbsNumOf } from '../utils/utils';
import WorkPackagesService from './work-packages.services';
import linkQueryArgs from '../prisma-query-args/links.query-args';
import linkTypeQueryArgs from '../prisma-query-args/link-types.query-args';
import { linkTypeTransformer } from '../transformers/links.transformer';

export default class ProjectsService {
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
    if (project.wbsElement.dateDeleted) throw new DeletedException('Project', project.projectId);

    return projectTransformer(project);
  }

  /**
   * Create a new project with the given information.
   * @param user the user creating the project
   * @param crId the change request id being used to create the project
   * @param carNumber the car number of the new project
   * @param name the name of the new project
   * @param summary the summary of the new project
   * @param teamIds the ids of the teams that the new project will be assigned to
   * @param budget the new budget of the project
   * @param linkCreateArgs the link create args
   * @param summary the new summary of the project
   * @param rules the new rules of the project
   * @param goals the new goals of the project
   * @param features the new features of the project
   * @param otherConstraints the new otherConstraints of the project
   * @param projectLeadId the new projectLead of the project
   * @param projectManagerId the new projectManager of the project
   * @returns the wbs number of the created project
   * @throws if the user doesn't have permission or if the change request is invalid
   */
  static async createProject(
    user: User,
    crId: number,
    carNumber: number,
    name: string,
    summary: string,
    teamIds: string[],
    budget: number | null,
    linkCreateArgs: LinkCreateArgs[] | null,
    rules: string[],
    goals: { id: number; detail: string }[] | null,
    features: { id: number; detail: string }[] | null,
    otherConstraints: { id: number; detail: string }[] | null,
    projectLeadId: number | null,
    projectManagerId: number | null
  ): Promise<WbsNumber> {
    if (isGuest(user.role)) throw new AccessDeniedGuestException('create projects');
    const { userId } = user;
    await validateChangeRequestAccepted(crId);

    if (teamIds.length > 0) {
      for (const teamId of teamIds) {
        const team = await prisma.team.findUnique({ where: { teamId } });
        if (!team) throw new NotFoundException('Team', teamId);
      }
    }

    const maxProjectNumber: number = await getHighestProjectNumber(carNumber);

    // create the wbs element and project as well as the associated change
    const createdWbsElement = await prisma.wBS_Element.create({
      data: {
        carNumber,
        projectNumber: maxProjectNumber + 1,
        workPackageNumber: 0,
        name,
        project: {
          create: {
            summary,
            teams: {
              connect: teamIds.map((teamId) => ({ teamId }))
            }
          }
        },
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

    const { wbsElementId, project: createdProject } = createdWbsElement;
    if (!createdProject) {
      throw new NotFoundException('Project', wbsElementId);
    }

    // Project has been created, so create the changes and add other details (like budget, project manager id, etc)
    await updateProjectAndCreateChanges(
      createdProject?.projectId,
      crId,
      userId,
      name,
      budget,
      summary,
      rules,
      goals,
      features,
      otherConstraints,
      linkCreateArgs,
      projectLeadId,
      projectManagerId
    );

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
    linkCreateArgs: LinkCreateArgs[],
    projectLeadId: number | null,
    projectManagerId: number | null
  ): Promise<Project> {
    if (isGuest(user.role)) throw new AccessDeniedGuestException('edit projects');
    const { userId } = user;

    await validateChangeRequestAccepted(crId);

    // get the original project so we can compare things
    const originalProject = await prisma.project.findUnique({
      where: {
        projectId
      },
      include: {
        wbsElement: {
          include: {
            links: {
              ...linkQueryArgs
            }
          }
        },
        goals: true,
        features: true,
        otherConstraints: true
      }
    });

    // if it doesn't exist we error
    if (!originalProject) throw new NotFoundException('Project', projectId);
    if (originalProject.wbsElement.dateDeleted) throw new DeletedException('Project', projectId);

    const { project: updatedProject } = await updateProjectAndCreateChanges(
      originalProject.projectId,
      crId,
      userId,
      name,
      budget,
      summary,
      rules,
      goals,
      features,
      otherConstraints,
      linkCreateArgs,
      projectLeadId,
      projectManagerId
    );

    // return the updated work package
    return projectTransformer(updatedProject);
  }

  /**
   * Adds or removes the given team to the projects teams depending if it is already assigned to the project or not.
   *
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
      },
      include: {
        teams: true
      }
    });

    if (!project) throw new NotFoundException('Project', wbsPipe(wbsNumber));

    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) throw new NotFoundException('Team', teamId);

    // check for user and user permission (admin, app admin, or leader of the team)
    if (!isAdmin(user.role) && user.userId !== team.headId) {
      throw new AccessDeniedAdminOnlyException('set project teams');
    }

    // check if the team is already assigned to the project if it is we remove it, otherwise we add it. We do this to toggle the team
    if (project.teams.some((currTeam) => currTeam.teamId === teamId)) {
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: {
          teams: {
            disconnect: {
              teamId
            }
          }
        }
      });
    } else {
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: {
          teams: {
            connect: {
              teamId
            }
          }
        }
      });
    }
  }

  /**
   * Delete the the project in the database along with all its dependencies.
   * @param user the user who is trying to delete the project
   * @param wbsNumber the wbsNumber of the project
   * @throws if the wbs number does not correspond to a project, the user trying to
   * delete the project is not admin/app-admin, or the project is not found.
   * @returns the project that is deleted.
   */
  static async deleteProject(user: User, wbsNumber: WbsNumber): Promise<Project> {
    if (!isProject(wbsNumber)) throw new HttpException(400, `${wbsPipe(wbsNumber)} is not a valid project WBS #!`);
    if (!isAdmin(user.role)) {
      throw new AccessDeniedAdminOnlyException('delete projects');
    }

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
    if (project.wbsElement.dateDeleted) throw new DeletedException('Project', project.projectId);

    const { projectId, wbsElementId } = project;

    const dateDeleted: Date = new Date();
    const deletedByUserId = user.userId;

    const deletedProject = await prisma.project.update({
      where: {
        projectId
      },
      data: {
        wbsElement: {
          update: {
            dateDeleted,
            deletedByUserId,
            changeRequests: {
              updateMany: {
                where: { wbsElementId },
                data: { dateDeleted, deletedByUserId }
              }
            }
          }
        },
        goals: {
          updateMany: {
            where: {
              projectIdGoals: projectId
            },
            data: {
              dateDeleted
            }
          }
        },
        features: {
          updateMany: {
            where: {
              projectIdFeatures: projectId
            },
            data: {
              dateDeleted
            }
          }
        },
        otherConstraints: {
          updateMany: {
            where: {
              projectIdOtherConstraints: projectId
            },
            data: {
              dateDeleted
            }
          }
        }
      },
      ...projectQueryArgs
    });

    // need to delete each of the project's work packages as well
    const workPackages = await prisma.work_Package.findMany({
      where: {
        projectId
      },
      include: { wbsElement: true }
    });

    await Promise.all(
      workPackages.map(
        async (workPackage) => await WorkPackagesService.deleteWorkPackage(user, wbsNumOf(workPackage.wbsElement))
      )
    );

    return projectTransformer(deletedProject);
  }

  /**
   * Toggles a user's favorite status on a projects
   * @param wbsNumber the project wbs number to be favorited/unfavorited
   * @param user the user who is favoriting/unfavoriting the project
   * @returns the project that the user has favorited/unfavorited
   * @throws if the project wbs doesn't exist or is not corresponding to a project
   */
  static async toggleFavorite(wbsNumber: WbsNumber, user: User): Promise<Project> {
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
    if (project.wbsElement.dateDeleted) throw new DeletedException('Project', project.projectId);

    const favorited = project.favoritedBy.some((currUser) => currUser.userId === user.userId);

    favorited
      ? await prisma.user.update({
          where: { userId: user.userId },
          data: {
            favoriteProjects: {
              disconnect: {
                projectId: project.projectId
              }
            }
          }
        })
      : await prisma.user.update({
          where: { userId: user.userId },
          data: {
            favoriteProjects: {
              connect: {
                projectId: project.projectId
              }
            }
          }
        });

    return projectTransformer(project);
  }

  static async getAllLinkTypes(): Promise<LinkType[]> {
    return (
      await prisma.linkType.findMany({
        ...linkTypeQueryArgs
      })
    ).map(linkTypeTransformer);
  }
}
