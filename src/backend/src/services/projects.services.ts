import { Manufacturer, Role, Material_Type, User, Assembly, Material_Status, Material } from '@prisma/client';
import { isAdmin, isGuest, isLeadership, isProject, LinkCreateArgs, LinkType, Project, WbsNumber, wbsPipe } from 'shared';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import prisma from '../prisma/prisma';
import projectTransformer from '../transformers/projects.transformer';
import { validateChangeRequestAccepted } from '../utils/change-requests.utils';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedGuestException,
  HttpException,
  NotFoundException,
  DeletedException,
  AccessDeniedException
} from '../utils/errors.utils';
import {
  addDescriptionBullets,
  checkMaterialInputs,
  editDescriptionBullets,
  getHighestProjectNumber,
  getUserFullName
} from '../utils/projects.utils';
import { wbsNumOf } from '../utils/utils';
import WorkPackagesService from './work-packages.services';
import { createChange, createListChanges } from '../utils/changes.utils';
import {
  DescriptionBulletPreview,
  descriptionBulletsToChangeListValues,
  descriptionBulletToChangeListValue
} from '../utils/description-bullets.utils';
import linkQueryArgs from '../prisma-query-args/links.query-args';
import linkTypeQueryArgs from '../prisma-query-args/link-types.query-args';
import manufacturerQueryArgs from '../prisma-query-args/manufacturers.query-args';
import { linkTypeTransformer } from '../transformers/links.transformer';
import { updateLinks, linkToChangeListValue } from '../utils/links.utils';
import { manufacturerTransformer } from '../transformers/manufacturer.transformer';
import { isUserPartOfTeams } from '../utils/teams.utils';

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
   * @returns the wbs number of the created project
   * @throws if the user doesn't have permission or if the change request is invalid
   */
  static async createProject(
    user: User,
    crId: number,
    carNumber: number,
    name: string,
    summary: string,
    teamIds: string[]
  ): Promise<WbsNumber> {
    if (isGuest(user.role)) throw new AccessDeniedGuestException('create projects');

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

    const { wbsElementId } = originalProject;

    let changes = [];

    // get the changes or undefined for each field and add it to changes
    const nameChangeJson = createChange('name', originalProject.wbsElement.name, name, crId, userId, wbsElementId);

    const budgetChangeJson = createChange('budget', originalProject.budget, budget, crId, userId, wbsElementId);

    const summaryChangeJson = createChange('summary', originalProject.summary, summary, crId, userId, wbsElementId);

    const projectManagerChangeJson = createChange(
      'project manager',
      await getUserFullName(originalProject.wbsElement.projectManagerId),
      await getUserFullName(projectManagerId),
      crId,
      userId,
      wbsElementId
    );

    const projectLeadChangeJson = createChange(
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
    if (projectManagerChangeJson !== undefined) {
      changes.push(projectManagerChangeJson);
    }
    if (projectLeadChangeJson !== undefined) {
      changes.push(projectLeadChangeJson);
    }

    // Dealing with lists
    const rulesChangeJson = createListChanges(
      'rules',
      originalProject.rules.map((rule) => {
        return {
          element: rule,
          comparator: rule,
          displayValue: rule
        };
      }),
      rules.map((rule) => {
        return {
          element: rule,
          comparator: rule,
          displayValue: rule
        };
      }),
      crId,
      userId,
      wbsElementId
    );

    const goalsChangeJson = createListChanges(
      'goals',
      descriptionBulletsToChangeListValues(originalProject.goals),
      goals.map((goal) => descriptionBulletToChangeListValue(goal)),
      crId,
      userId,
      wbsElementId
    );

    const featuresChangeJson = createListChanges(
      'features',
      descriptionBulletsToChangeListValues(originalProject.features),
      features.map((feature) => descriptionBulletToChangeListValue(feature)),
      crId,
      userId,
      wbsElementId
    );

    const otherConstraintsChangeJson = createListChanges(
      'other constraints',
      descriptionBulletsToChangeListValues(originalProject.otherConstraints),
      otherConstraints.map((constraint) => descriptionBulletToChangeListValue(constraint)),
      crId,
      userId,
      wbsElementId
    );

    const linkChanges = createListChanges(
      'link',
      originalProject.wbsElement.links.map(linkToChangeListValue),
      linkCreateArgs.map(linkToChangeListValue),
      crId,
      userId,
      wbsElementId
    );

    // add the changes for each of blockers, expected activities, and deliverables
    changes = changes
      .concat(rulesChangeJson.changes)
      .concat(goalsChangeJson.changes)
      .concat(featuresChangeJson.changes)
      .concat(otherConstraintsChangeJson.changes)
      .concat(linkChanges.changes);

    // update the project with the input fields
    const updatedProject = await prisma.project.update({
      where: {
        wbsElementId
      },
      data: {
        budget,
        summary,
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
    const deletedDescriptionBullets: DescriptionBulletPreview[] = goalsChangeJson.deletedElements
      .concat(featuresChangeJson.deletedElements)
      .concat(otherConstraintsChangeJson.deletedElements);

    if (deletedDescriptionBullets.length > 0) {
      await prisma.description_Bullet.updateMany({
        where: {
          descriptionId: {
            in: deletedDescriptionBullets.map((descriptionBullet) => descriptionBullet.id)
          }
        },
        data: {
          dateDeleted: new Date()
        }
      });
    }

    // Add the new goals
    await addDescriptionBullets(
      goalsChangeJson.addedElements.map((descriptionBullet) => descriptionBullet.detail),
      updatedProject.projectId,
      'projectIdGoals'
    );
    // Add the new features
    await addDescriptionBullets(
      featuresChangeJson.addedElements.map((descriptionBullet) => descriptionBullet.detail),
      updatedProject.projectId,
      'projectIdFeatures'
    );
    // Add the new other constraints
    await addDescriptionBullets(
      otherConstraintsChangeJson.addedElements.map((descriptionBullet) => descriptionBullet.detail),
      updatedProject.projectId,
      'projectIdOtherConstraints'
    );
    // Edit the existing description bullets
    await editDescriptionBullets(
      goalsChangeJson.editedElements
        .concat(featuresChangeJson.editedElements)
        .concat(otherConstraintsChangeJson.editedElements)
    );

    // Update the links
    await updateLinks(linkChanges, updatedProject.wbsElementId, userId);

    // create the changes in prisma
    await prisma.change.createMany({
      data: changes
    });

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

  /**
   * Creates a new Material
   * @param creator the user creating the material
   * @param name the name of the material
   * @param status the Material Status of the material
   * @param materialTypeName the name of the Material Type
   * @param manufacturerName the name of the material's manufacturer
   * @param manufacturerPartNumber the manufacturer part number for the material
   * @param quantity the quantity of material as a number
   * @param price the price of the material in whole cents
   * @param subtotal the subtotal of the price for the material in whole cents
   * @param linkUrl the url for the material's link as a string
   * @param notes any notes about the material as a string
   * @param wbsNumber the WBS number of the project associated with this material
   * @param assemblyId the id of the Assembly for the material
   * @param pdmFileName the name of the pdm file for the material
   * @param unitName the name of the Quantity Unit the quantity is measured in
   * @returns the created material
   */
  static async createMaterial(
    creator: User,
    name: string,
    status: Material_Status,
    materialTypeName: string,
    manufacturerName: string,
    manufacturerPartNumber: string,
    quantity: number,
    price: number,
    subtotal: number,
    linkUrl: string,
    notes: string,
    wbsNumber: WbsNumber,
    assemblyId?: string,
    pdmFileName?: string,
    unitName?: string
  ): Promise<Material> {
    const project = await prisma.project.findFirst({
      where: {
        wbsElement: {
          carNumber: wbsNumber.carNumber,
          projectNumber: wbsNumber.projectNumber,
          workPackageNumber: wbsNumber.workPackageNumber
        }
      },
      ...projectQueryArgs
    });

    if (!project) throw new NotFoundException('Project', wbsPipe(wbsNumber));

    await checkMaterialInputs(manufacturerName, materialTypeName, unitName, assemblyId);

    const perms = isLeadership(creator.role) || isUserPartOfTeams(project.teams, creator);

    if (!perms) throw new AccessDeniedException('create materials');

    const createdMaterial = await prisma.material.create({
      data: {
        userCreatedId: creator.userId,
        name,
        assemblyId,
        status,
        materialTypeName,
        manufacturerName,
        manufacturerPartNumber,
        pdmFileName,
        quantity,
        unitName,
        price,
        subtotal,
        linkUrl,
        notes,
        dateCreated: new Date(),
        wbsElementId: project.wbsElementId
      }
    });

    return createdMaterial;
  }

  /**
   * Create an assembly
   * @param name The name of the assembly to be created
   * @param userCreated The user creating the assembly
   * @param wbsElementId The
   * @param pdmFileName optional - The name of the file holding the assembly
   * @returns the project that the user has favorited/unfavorited
   * @throws if the project wbs doesn't exist or is not corresponding to a project
   */
  static async createAssembly(
    name: string,
    userCreated: User,
    wbsNumber: WbsNumber,
    pdmFileName?: string
  ): Promise<Assembly> {
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

    const checkAssembly = await prisma.assembly.findUnique({ where: { name } });

    if (checkAssembly) throw new HttpException(400, `${name} already exists as an assembly!`);

    const { teams, wbsElementId } = project;

    if (!isAdmin(userCreated.role) && !isUserPartOfTeams(teams, userCreated))
      throw new AccessDeniedException('Users must be admin, or assigned to the team to create assemblies');

    const userCreatedId = userCreated.userId;

    const assembly = await prisma.assembly.create({
      data: {
        name,
        dateCreated: new Date(),
        userCreatedId,
        wbsElementId,
        pdmFileName
      }
    });

    return assembly;
  }

  /*
   * Creates a new Manufacturer
   * @param submitter the user who's creating the manufacturer
   * @param name the name of the manufacturer
   * @returns the newly created manufacturer
   * @throws if the submitter is a guest or the given manufacturer name already exists
   */
  static async createManufacturer(submitter: User, name: string) {
    if (isGuest(submitter.role)) throw new AccessDeniedGuestException('create manufacturers');

    const manufacturer = await prisma.manufacturer.findUnique({
      where: {
        name
      }
    });

    if (manufacturer) throw new HttpException(400, `${name} already exists as a manufacturer!`);

    const newManufacturer = await prisma.manufacturer.create({
      data: { name, dateCreated: new Date(), creatorId: submitter.userId }
    });

    return newManufacturer;
  }

  /**
   * Get all the manufacturers in the database.
   * @returns all the manufacturers
   */
  static async getAllManufacturers(submitter: User): Promise<Manufacturer[]> {
    if (submitter.role === Role.GUEST) {
      throw new AccessDeniedGuestException('Get Manufacturers');
    }

    return (
      await prisma.manufacturer.findMany({
        ...manufacturerQueryArgs
      })
    ).map(manufacturerTransformer);
  }

  /**
   * Create a new material type
   * @param name the name of the new material type
   * @param submitter the user who is creating the material type
   * @throws if the submitter is not a leader or the material type with the given name already exists
   */
  static async createMaterialType(name: string, submitter: User): Promise<Material_Type> {
    if (!isLeadership(submitter.role))
      throw new AccessDeniedException('Only leadership or above can create a material type');

    const materialType = await prisma.material_Type.findUnique({
      where: {
        name
      }
    });

    if (!!materialType) throw new HttpException(400, `The following material type already exists: ${name}`);

    const newMaterialType = await prisma.material_Type.create({
      data: {
        name,
        dateCreated: new Date(),
        creatorId: submitter.userId
      }
    });

    return newMaterialType;
  }

  /**
   * Update a material
   * @param submitter the submitter of the request
   * @param materialId the material id of the material being edited
   * @param name the name of the edited material
   * @param status the status of the edited material
   * @param materialTypeName the material type of the edited material
   * @param manufacturerName the manufacturerName of the edited material
   * @param manufacturerPartNumber the manufacturerPartNumber of the edited material
   * @param quantity the quantity of the edited material
   * @param price the price of the edited material
   * @param subtotal the subtotal of the edited material
   * @param linkUrl the linkUrl of the edited material
   * @param notes the notes of the edited material
   * @param unitName the unit name of the edited material
   * @param assemblyId the assembly id of the edited material
   * @param pdmFileName the pdm file name of the edited material
   * @throws if permission denied or material's wbsElement is undefined/deleted
   * @returns the updated material
   */
  static async editMaterial(
    submitter: User,
    materialId: string,
    name: string,
    status: Material_Status,
    materialTypeName: string,
    manufacturerName: string,
    manufacturerPartNumber: string,
    quantity: number,
    price: number,
    subtotal: number,
    linkUrl: string,
    notes: string,
    unitName?: string,
    assemblyId?: string,
    pdmFileName?: string
  ): Promise<Material> {
    const material = await prisma.material.findUnique({
      where: {
        materialId
      }
    });

    if (!material) throw new NotFoundException('Material', materialId);
    if (material.dateDeleted) throw new DeletedException('Material', materialId);

    const project = await prisma.project.findFirst({
      where: {
        wbsElementId: material.wbsElementId
      },
      ...projectQueryArgs
    });

    if (!project) throw new NotFoundException('Project', material.wbsElementId);
    if (project.wbsElement.dateDeleted) throw new DeletedException('Project', project.projectId);

    await checkMaterialInputs(manufacturerName, materialTypeName, unitName, assemblyId);

    const perms = isLeadership(submitter.role) || isUserPartOfTeams(project.teams, submitter);

    if (!perms) throw new AccessDeniedException('update material');

    const updatedMaterial = await prisma.material.update({
      where: { materialId },
      data: {
        name,
        status,
        materialTypeName,
        manufacturerName,
        manufacturerPartNumber,
        quantity,
        unitName,
        price,
        subtotal,
        linkUrl,
        notes,
        wbsElementId: project.wbsElementId,
        assemblyId,
        pdmFileName
      }
    });

    return updatedMaterial;
  }
}
