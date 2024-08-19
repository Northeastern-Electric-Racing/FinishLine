import { User } from '@prisma/client';
import {
  DescriptionBulletPreview,
  isAdmin,
  isGuest,
  isProject,
  LinkCreateArgs,
  LinkType,
  Project,
  WbsNumber,
  wbsPipe
} from 'shared';
import prisma from '../prisma/prisma';
import projectTransformer from '../transformers/projects.transformer';
import { validateChangeRequestAccepted } from '../utils/change-requests.utils';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedGuestException,
  HttpException,
  NotFoundException,
  DeletedException,
  AccessDeniedException,
  InvalidOrganizationException
} from '../utils/errors.utils';
import { updateProjectAndCreateChanges, getHighestProjectNumber } from '../utils/projects.utils';
import { wbsNumOf } from '../utils/utils';
import WorkPackagesService from './work-packages.services';
import { linkTypeTransformer } from '../transformers/links.transformer';
import { userHasPermission } from '../utils/users.utils';
import { getProjectQueryArgs } from '../prisma-query-args/projects.query-args';
import { getLinkQueryArgs } from '../prisma-query-args/links.query-args';
import { getDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args';
import { getLinkTypeQueryArgs } from '../prisma-query-args/link-types.query-args';

export default class ProjectsService {
  /**
   * Get all the non deleted projects in the database for the given organization.
   * @param organizationId the id of the organization the user is currently in
   * @returns all the projects
   */
  static async getAllProjects(organizationId: string): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: { wbsElement: { dateDeleted: null, organizationId } },
      ...getProjectQueryArgs(organizationId)
    });
    return projects.map(projectTransformer);
  }

  /**
   * Get a single project
   * @param wbsNumber the wbsNumber of the project to get
   * @param organizationId the id of the organization the user is currently in
   * @returns the request project
   * @throws if the wbsNumber is invalid, the project is not found, or the project is deleted
   */
  static async getSingleProject(wbsNumber: WbsNumber, organizationId: string): Promise<Project> {
    if (!isProject(wbsNumber)) throw new HttpException(400, `${wbsPipe(wbsNumber)} is not a valid project WBS #!`);

    const { carNumber, projectNumber, workPackageNumber } = wbsNumber;

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber,
          organizationId
        }
      },
      include: {
        project: {
          ...getProjectQueryArgs(organizationId)
        }
      }
    });

    const project = wbsElement?.project;

    if (!project) throw new NotFoundException('Project', wbsPipe(wbsNumber));
    if (project.wbsElement.dateDeleted) throw new DeletedException('Project', project.projectId);
    if (project.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Project');

    return projectTransformer(project);
  }

  static async getSingleProjectWithQueryArgs(wbsNumber: WbsNumber, organizationId: string) {
    if (!isProject(wbsNumber)) throw new HttpException(400, `${wbsPipe(wbsNumber)} is not a valid project WBS #!`);

    const { carNumber, projectNumber, workPackageNumber } = wbsNumber;

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber,
          organizationId
        }
      },
      include: {
        project: {
          ...getProjectQueryArgs(organizationId)
        }
      }
    });

    const project = wbsElement?.project;

    if (!project) throw new NotFoundException('Project', wbsPipe(wbsNumber));
    if (project.wbsElement.dateDeleted) throw new DeletedException('Project', project.projectId);
    if (project.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Project');

    return project;
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
   * @param descriptionBullets the new description bullets of the project
   * @param leadId the new lead of the project
   * @param managerId the new manager of the project
   * @param organizationId the id of the organization the user is currently in
   * @returns the wbs number of the created project
   * @throws if the user doesn't have permission or if the change request is invalid
   */
  static async createProject(
    user: User,
    crId: string,
    carNumber: number,
    name: string,
    summary: string,
    teamIds: string[],
    budget: number | null,
    linkCreateArgs: LinkCreateArgs[] | null,
    descriptionBullets: DescriptionBulletPreview[],
    leadId: string | null,
    managerId: string | null,
    organizationId: string
  ): Promise<Project> {
    const { userId } = user;
    if (await userHasPermission(userId, organizationId, isGuest)) throw new AccessDeniedGuestException('create projects');

    await validateChangeRequestAccepted(crId);

    if (teamIds.length > 0) {
      for (const teamId of teamIds) {
        const team = await prisma.team.findUnique({ where: { teamId } });
        if (!team) throw new NotFoundException('Team', teamId);
        if (team.organizationId !== organizationId) throw new InvalidOrganizationException('Team');
      }
    }

    const carWbs = await prisma.wBS_Element.findUnique({
      where: { wbsNumber: { carNumber, projectNumber: 0, workPackageNumber: 0, organizationId } },
      include: { car: true }
    });
    if (!carWbs?.car) throw new NotFoundException('Car', carNumber);

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
            },
            carId: carWbs.car.carId
          }
        },
        changes: {
          create: {
            changeRequestId: crId,
            implementerId: user.userId,
            detail: 'New Project Created'
          }
        },
        organizationId: carWbs.organizationId
      },
      include: {
        project: {
          ...getProjectQueryArgs(organizationId)
        },
        changes: true
      }
    });

    const { wbsElementId, project: createdProject } = createdWbsElement;
    if (!createdProject) {
      throw new NotFoundException('Project', wbsElementId);
    }

    // Project has been created, so create the changes and add other details (like budget, project manager id, etc)
    await updateProjectAndCreateChanges(
      createdProject.projectId,
      crId,
      userId,
      name,
      budget,
      summary,
      descriptionBullets,
      linkCreateArgs,
      leadId,
      managerId,
      organizationId
    );

    return projectTransformer(createdProject);
  }

  /**
   * Edits the given project with the given information.
   * @param user the user editing the project
   * @param projectId the id of the project to edit
   * @param crId the change request used to do the editing
   * @param name the new name of the project
   * @param budget the new budget of the project
   * @param summary the new summary of the project
   * @param newDescriptionBullets the new description bullets of the project
   * @param linkCreateArgs the new links of the project
   * @param leadId the new lead of the project
   * @param managerId the new manager of the project
   * @param organizationId the id of the organization the user is currently in
   * @returns the edited project
   */
  static async editProject(
    user: User,
    projectId: string,
    crId: string,
    name: string,
    budget: number,
    summary: string,
    newDescriptionBullets: DescriptionBulletPreview[],
    linkCreateArgs: LinkCreateArgs[],
    leadId: string | null,
    managerId: string | null,
    organizationId: string
  ): Promise<Project> {
    const { userId } = user;
    if (await userHasPermission(userId, organizationId, isGuest)) throw new AccessDeniedGuestException('edit projects');

    await validateChangeRequestAccepted(crId);

    // get the original project so we can compare things
    const originalProject = await prisma.project.findUnique({
      where: {
        projectId
      },
      include: {
        wbsElement: {
          include: {
            links: getLinkQueryArgs(organizationId),
            descriptionBullets: getDescriptionBulletQueryArgs(organizationId)
          }
        }
      }
    });

    // if it doesn't exist we error
    if (!originalProject) throw new NotFoundException('Project', projectId);
    if (originalProject.wbsElement.dateDeleted) throw new DeletedException('Project', projectId);
    if (originalProject.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Project');

    const { project: updatedProject } = await updateProjectAndCreateChanges(
      originalProject.projectId,
      crId,
      userId,
      name,
      budget,
      summary,
      newDescriptionBullets,
      linkCreateArgs,
      leadId,
      managerId,
      organizationId
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
   * @param organizationId the id of the organization the user is currently in
   * @throws if the project isn't found, the team isn't found, or the user doesn't have access
   */
  static async setProjectTeam(user: User, wbsNumber: WbsNumber, teamId: string, organizationId: string): Promise<void> {
    if (!isProject(wbsNumber)) throw new HttpException(400, `${wbsPipe(wbsNumber)} is not a valid project WBS #!`);

    // find the associated project
    const project = await ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organizationId);

    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) throw new NotFoundException('Team', teamId);
    if (team.organizationId !== organizationId) throw new InvalidOrganizationException('Team');

    // check for user and user permission (admin, app admin, or leader of the team)
    if (!(await userHasPermission(user.userId, organizationId, isAdmin)) && user.userId !== team.headId) {
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
   * @param changeRequestIdentifier the id for the change request whose changes are to be
   * implemented by the deletions of each work package in this project
   * @param organizationId the id of the organization the user is currently in
   * @throws if the wbs number does not correspond to a project, the user trying to
   * delete the project is not admin/app-admin, or the project is not found.
   * @returns the project that is deleted.
   */
  static async deleteProject(
    user: User,
    wbsNumber: WbsNumber,
    changeRequestIdentifier: string,
    organizationId: string
  ): Promise<Project> {
    if (!(await userHasPermission(user.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete projects');
    }

    const changeRequest = await prisma.change_Request.findUnique({
      where: {
        uniqueChangeRequest: {
          identifier: Number.parseInt(changeRequestIdentifier),
          organizationId
        }
      }
    });

    if (!changeRequest) {
      throw new NotFoundException('Change Request', changeRequestIdentifier);
    }

    if (changeRequest.dateDeleted) {
      throw new DeletedException('Change Request', changeRequestIdentifier);
    }

    await validateChangeRequestAccepted(changeRequest.crId);

    const project = await ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organizationId);

    const { projectId, wbsElementId } = project;

    // need to delete each of the project's work packages as well
    const workPackages = await prisma.work_Package.findMany({
      where: {
        projectId
      },
      include: { wbsElement: true }
    });

    await Promise.all(
      workPackages.map(async (workPackage) => {
        try {
          await WorkPackagesService.deleteWorkPackage(
            user,
            wbsNumOf(workPackage.wbsElement),
            changeRequestIdentifier,
            organizationId
          );
        } catch (error) {
          // do nothing
        }
      })
    );

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
            },
            descriptionBullets: {
              updateMany: {
                where: {
                  wbsElementId
                },
                data: {
                  dateDeleted
                }
              }
            }
          }
        }
      },
      ...getProjectQueryArgs(organizationId)
    });

    return projectTransformer(deletedProject);
  }

  /**
   * Toggles a user's favorite status on a projects
   * @param wbsNumber the project wbs number to be favorited/unfavorited
   * @param user the user who is favoriting/unfavoriting the project
   * @param organizationId the id of the organization the user is currently in
   * @returns the project that the user has favorited/unfavorited
   * @throws if the project wbs doesn't exist or is not corresponding to a project
   */
  static async toggleFavorite(wbsNumber: WbsNumber, user: User, organizationId: string): Promise<Project> {
    const project = await ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organizationId);

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

  /**
   * Gets all the link types in the users organization
   * @param organizationId The organization the user is currently in
   * @returns all the link types in the users organization
   */
  static async getAllLinkTypes(organizationId: string): Promise<LinkType[]> {
    return (
      await prisma.link_Type.findMany({
        where: {
          organizationId
        },
        ...getLinkTypeQueryArgs(organizationId)
      })
    ).map(linkTypeTransformer);
  }

  /**
   * Creates a new LinkType with the given information
   *
   * @param name the name of the new LinkType
   * @param iconName the name of the icon for the new LinkType
   * @param required is the new LinkType required
   * @param user the user who is creating the new LinkType
   * @param orgainzationId the organization the link type is being created for
   * @throws AccessDeniedException if the submitter of the request is not an admin
   * @throws HttpException if a LinkType of the given name already exists
   * @returns the created LinkType
   */
  static async createLinkType(
    user: User,
    name: string,
    iconName: string,
    required: boolean,
    organizationId: string
  ): Promise<LinkType> {
    if (!(await userHasPermission(user.userId, organizationId, isAdmin)))
      throw new AccessDeniedException('Only admins can create link types');

    const organization = await prisma.organization.findUnique({
      where: {
        organizationId
      }
    });

    if (!organization) throw new NotFoundException('Organization', organizationId);

    const existingLinkType = await prisma.link_Type.findUnique({
      where: { uniqueLinkType: { name, organizationId } }
    });

    if (existingLinkType) throw new HttpException(400, 'LinkType with that name already exists in this organization.');

    const linkType = await prisma.link_Type.create({
      data: {
        name,
        creatorId: user.userId,
        iconName,
        required,
        organizationId
      },
      ...getLinkTypeQueryArgs(organizationId)
    });

    return linkTypeTransformer(linkType);
  }

  /**
   * Updates the linkType's name, iconName, or required.
   * @param linkName the name of the linkType being editted
   * @param iconName the new iconName
   * @param required the new required status
   * @param submitter user requesting the edit
   * @param organizationId the organization the user is currently in
   * @returns the updated linkType
   */
  static async editLinkType(
    linkName: string,
    iconName: string,
    required: boolean,
    submitter: User,
    organizationId: string
  ): Promise<LinkType> {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedException('Only an admin can update the linkType');

    // check if the linkType we are trying to update exists
    const linkType = await prisma.link_Type.findUnique({
      where: {
        uniqueLinkType: {
          name: linkName,
          organizationId
        }
      }
    });

    if (!linkType) throw new NotFoundException('Link Type', linkName);

    // update the LinkType
    const linkTypeUpdated = await prisma.link_Type.update({
      where: { id: linkType.id },
      data: {
        name: linkName,
        iconName,
        required
      },
      ...getLinkTypeQueryArgs(organizationId)
    });
    return linkTypeTransformer(linkTypeUpdated);
  }
}
