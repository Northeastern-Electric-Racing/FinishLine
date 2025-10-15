import { Organization } from '@prisma/client';
import {
  DescriptionBulletPreview,
  isAdmin,
  isGuest,
  ProjectTemplate,
  WorkPackageStage,
  WorkPackageTemplate,
  WorkPackageTemplateApiInputs,
  User
} from 'shared';
import prisma from '../prisma/prisma';
import {
  NotFoundException,
  HttpException,
  AccessDeniedGuestException,
  AccessDeniedAdminOnlyException,
  DeletedException,
  InvalidOrganizationException
} from '../utils/errors.utils';
import { createListChanges } from '../utils/changes.utils';
import {
  DescriptionBulletDestination,
  addRawDescriptionBullets,
  descriptionBulletToChangeListValue,
  descriptionBulletsToChangeListValues,
  editDescriptionBullets,
  markDescriptionBulletsAsDeleted,
  validateDescriptionBullets
} from '../utils/description-bullets.utils';
import { deleteBlockingTemplates, validateBlockedByTemplates } from '../utils/work-packages.utils';
import {
  projectTemplateTransformer,
  workPackageTemplateTransformer
} from '../transformers/work-package-template.transformer';
import {
  getProjectTemplateQueryArgs,
  getWorkPackageTemplateQueryArgs
} from '../prisma-query-args/wbs-element-template.query-args';
import { getDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args';
import { userHasPermission } from '../utils/users.utils';

/** Service layer containing logic for work package controller functions. */
export default class WbsElementTemplatesService {
  /**
   * Gets a single requested work package template
   * @param submitter - the user making the request to get the given work package template
   * @param workPackageTemplateId - the id of the work package template to be returned
   * @param organizationId - the id of the organization that the user is currently in
   * @returns a single work package template
   */
  static async getSingleWorkPackageTemplate(
    submitter: User,
    workPackageTemplateId: string,
    organization: Organization
  ): Promise<WorkPackageTemplate> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest)) {
      throw new AccessDeniedGuestException('get a work package template');
    }

    const template = await prisma.work_Package_Template.findUnique({
      where: {
        wbsElementTemplateId: workPackageTemplateId
      },
      ...getWorkPackageTemplateQueryArgs(organization.organizationId)
    });

    if (!template) throw new HttpException(400, `Work package template with id ${workPackageTemplateId} not found`);

    if (template.wbsElementTemplate.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Work Package Template');

    return workPackageTemplateTransformer(template);
  }

  /**
   * Gets all work package templates
   * @param submitter  - the user making the request to get all work package templates
   * @param organizationId - the id of the organization to get all work package templates for
   * @returns an array of all work package templates
   */
  static async getAllWorkPackageTemplates(submitter: User, organization: Organization): Promise<WorkPackageTemplate[]> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest)) {
      throw new AccessDeniedGuestException('get all work package templates.');
    }

    const workPackageTemplates = await prisma.work_Package_Template.findMany({
      where: {
        wbsElementTemplate: { dateDeleted: null, organizationId: organization.organizationId },
        projectTemplateId: null
      }, // only get the work package templates that are not associated with a project template
      ...getWorkPackageTemplateQueryArgs(organization.organizationId)
    });

    return workPackageTemplates.map(workPackageTemplateTransformer);
  }

  /**
   * Creates a Work_Package_Template in the database
   *
   * @param user the user creating the work package template
   * @param templateName the template name
   * @param templateNotes the template notes
   * @param workPackageName the name of the work packge
   * @param stage the stage
   * @param duration the duration of the work package template in weeks
   * @param expectedActivities the expected activities descriptions for this WPT
   * @param deliverables the expected deliverables descriptions for this WPT
   * @param blockedByIds the WBS elements that need to be completed before this WPT
   * @param organizationId the id of the organization that the user is currently in
   * @param workPackageTemplateId the id of the work package template
   * @returns the created work package template
   * @throws if the work package template could not be created
   */
  static async createWorkPackageTemplate(
    user: User,
    templateName: string,
    templateNotes: string,
    workPackageName: string | null,
    stage: WorkPackageStage | null,
    duration: number | null,
    descriptionBullets: DescriptionBulletPreview[],
    blockedByIds: string[],
    organization: Organization,
    workPackageTemplateId?: string
  ): Promise<WorkPackageTemplate> {
    if (!(await userHasPermission(user.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create work package templates');

    // get the corresponding IDs of all work package templates in BlockedBy,
    // and throw an errror if the template doesn't exist
    await Promise.all(
      blockedByIds.map(async (workPackageTemplateId) => {
        const template = await prisma.work_Package_Template.findFirst({
          where: { wbsElementTemplateId: workPackageTemplateId }
        });

        if (!template) {
          throw new NotFoundException('Work Package Template', workPackageTemplateId);
        }
        return template.wbsElementTemplateId;
      })
    );

    await validateDescriptionBullets(descriptionBullets, organization.organizationId);

    // add to the db
    const created = await prisma.work_Package_Template.create({
      data: {
        wbsElementTemplate: {
          create: {
            wbsElementTemplateId: workPackageTemplateId,
            templateName,
            templateNotes,
            wbsElementName: workPackageName,
            userCreated: { connect: { userId: user.userId } },
            organization: { connect: { organizationId: organization.organizationId } }
          }
        },
        stage,
        duration,
        blockedBy: {
          connect: blockedByIds.map((blockedById) => ({ wbsElementTemplateId: blockedById }))
        }
      },

      ...getWorkPackageTemplateQueryArgs(organization.organizationId)
    });

    await addRawDescriptionBullets(
      descriptionBullets,
      DescriptionBulletDestination.WORK_PACKAGE_TEMPLATE,
      created.wbsElementTemplateId,
      organization.organizationId
    );

    return workPackageTemplateTransformer(created);
  }

  /**
   * Edits a work package template given the specified parameters
   * @param submitter user who is submitting the edit
   * @param workPackageTemplateId id of the work package template being edited
   * @param templateName name of the work package template
   * @param templateNotes notes about the work package template
   * @param duration duration value on the template
   * @param stage stage value on the template
   * @param blockedByIds array of templates blocking this
   * @param expectedActivities array of expected activity values on the template
   * @param deliverables array of deliverable values on the template
   * @param workPackageName name value on the template
   * @param organizationId id of the organization that the user is currently in
   * @returns the updated work package template
   */
  static async editWorkPackageTemplate(
    submitter: User,
    workPackageTemplateId: string,
    templateName: string,
    templateNotes: string,
    duration: number | null,
    stage: WorkPackageStage | null,
    blockedByIds: string[],
    descriptionBullets: DescriptionBulletPreview[],
    workPackageName: string | null,
    organization: Organization
  ): Promise<WorkPackageTemplate> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('edit work package templates');

    const originalWorkPackageTemplate = await prisma.work_Package_Template.findUnique({
      where: { wbsElementTemplateId: workPackageTemplateId },
      include: {
        blockedBy: true,
        wbsElementTemplate: { include: { descriptionBullets: getDescriptionBulletQueryArgs(organization.organizationId) } }
      }
    });

    if (!originalWorkPackageTemplate) throw new NotFoundException('Work Package Template', workPackageTemplateId);
    if (originalWorkPackageTemplate.wbsElementTemplate.dateDeleted)
      throw new DeletedException('Work Package Template', workPackageTemplateId);
    if (originalWorkPackageTemplate.wbsElementTemplate.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Work Package Template');

    await validateBlockedByTemplates(blockedByIds, workPackageTemplateId);

    // only care about getting the deleted, added, edited description bullets
    const descriptionBulletsChanges = createListChanges(
      '',
      descriptionBulletsToChangeListValues(originalWorkPackageTemplate.wbsElementTemplate.descriptionBullets),
      descriptionBullets.map(descriptionBulletToChangeListValue),
      '',
      '',
      ''
    );

    const updatedWorkPackageTemplate = await prisma.work_Package_Template.update({
      where: {
        wbsElementTemplateId: workPackageTemplateId
      },
      data: {
        wbsElementTemplate: {
          update: {
            templateName,
            templateNotes,
            wbsElementName: workPackageName
          }
        },
        duration,
        stage,
        blockedBy: {
          set: [], // remove all the connections then add all the given ones
          connect: blockedByIds.map((blockedById) => ({ wbsElementTemplateId: blockedById }))
        }
      },
      ...getWorkPackageTemplateQueryArgs(organization.organizationId)
    });

    await editDescriptionBullets(
      descriptionBulletsChanges.editedElements,
      originalWorkPackageTemplate.wbsElementTemplate.organizationId
    );

    await addRawDescriptionBullets(
      descriptionBulletsChanges.addedElements,
      DescriptionBulletDestination.WORK_PACKAGE_TEMPLATE,
      updatedWorkPackageTemplate.wbsElementTemplateId,
      updatedWorkPackageTemplate.wbsElementTemplate.organizationId
    );

    // Update any deleted description bullets to have their date deleted as right now
    await markDescriptionBulletsAsDeleted(descriptionBulletsChanges.deletedElements);

    return workPackageTemplateTransformer(updatedWorkPackageTemplate);
  }

  /**
   * Deletes the Work Package template
   * @param submitter The user who deleted the work package
   * @param workPackageTemplateId The id of the work package template to be deleted
   * @param organizationId The organization id that the user is in
   */
  static async deleteWorkPackageTemplate(
    submitter: User,
    workPackageTemplateId: string,
    organization: Organization,
    checkIfDeleted = true
  ): Promise<void> {
    // Verify submitter is allowed to delete work packages
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete work package template');

    const workPackageTemplate = await prisma.work_Package_Template.findUnique({
      where: {
        wbsElementTemplateId: workPackageTemplateId
      },
      include: {
        blocking: true,
        wbsElementTemplate: true
      }
    });

    if (!workPackageTemplate) {
      throw new NotFoundException('Work Package Template', workPackageTemplateId);
    }

    if (workPackageTemplate.wbsElementTemplate.dateDeleted) {
      if (checkIfDeleted) throw new DeletedException('Work Package Template', workPackageTemplateId);
      else return;
    }

    if (workPackageTemplate.wbsElementTemplate.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Work Package Template');
    }

    const dateDeleted = new Date();

    if (workPackageTemplate.blocking.length > 0) {
      await deleteBlockingTemplates(workPackageTemplate, submitter);
    }

    // Soft delete the work package template by updating its related "deleted" fields
    await prisma.work_Package_Template.update({
      where: {
        wbsElementTemplateId: workPackageTemplateId
      },
      data: {
        wbsElementTemplate: {
          update: {
            dateDeleted,
            userDeleted: {
              connect: {
                userId: submitter.userId
              }
            }
          }
        }
      }
    });
  }

  /**
   * Retrieves all project templates
   * @param submitter the user submitting the request
   * @param organization the organization to get the project templates of
   * @returns an array of all project templates
   */
  static async getAllProjectTemplates(submitter: User, organization: Organization): Promise<ProjectTemplate[]> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest)) {
      throw new AccessDeniedGuestException('get project templates');
    }

    const projectTemplates = await prisma.project_Template.findMany({
      where: { wbsElementTemplate: { dateDeleted: null, organizationId: organization.organizationId } },
      ...getProjectTemplateQueryArgs(organization.organizationId)
    });

    return projectTemplates
      .sort((a, b) => a.wbsElementTemplate.dateCreated.getTime() - b.wbsElementTemplate.dateCreated.getTime())
      .map(projectTemplateTransformer);
  }

  /**
   * Deletes a project template
   * @param submitter the user submitting the request
   * @param projectTemplateId the id of the project template to delete
   * @param organization the organization to delete the project template from
   */
  static async deleteProjectTemplate(submitter: User, projectTemplateId: string, organization: Organization): Promise<void> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete project template');
    }

    const projectTemplate = await prisma.project_Template.findUnique({
      where: {
        wbsElementTemplateId: projectTemplateId
      },
      include: {
        workPackageTemplates: true,
        wbsElementTemplate: true
      }
    });

    if (!projectTemplate) {
      throw new NotFoundException('Project Template', projectTemplateId);
    }

    if (projectTemplate.wbsElementTemplate.dateDeleted) {
      throw new DeletedException('Project Template', projectTemplateId);
    }

    if (projectTemplate.wbsElementTemplate.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project Template');
    }

    const dateDeleted = new Date();

    // Delete all work package templates associated with the project template
    projectTemplate.workPackageTemplates.forEach(async (template) => {
      this.deleteWorkPackageTemplate(submitter, template.wbsElementTemplateId, organization, false);
    });

    // Soft delete the project template by updating its related "deleted" fields
    await prisma.project_Template.update({
      where: {
        wbsElementTemplateId: projectTemplateId
      },
      data: {
        wbsElementTemplate: {
          update: {
            dateDeleted,
            userDeleted: {
              connect: {
                userId: submitter.userId
              }
            }
          }
        }
      }
    });
  }

  static async getSingleProjectTemplate(
    submitter: User,
    projectTemplateId: string,
    organization: Organization
  ): Promise<ProjectTemplate> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest)) {
      throw new AccessDeniedGuestException('get a project template');
    }

    const projectTemplate = await prisma.project_Template.findUnique({
      where: {
        wbsElementTemplateId: projectTemplateId,
        wbsElementTemplate: { dateDeleted: null, organizationId: organization.organizationId }
      },
      ...getProjectTemplateQueryArgs(organization.organizationId)
    });

    if (!projectTemplate) {
      throw new NotFoundException('Project Template', projectTemplateId);
    }

    if (projectTemplate.wbsElementTemplate.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project Template');
    }

    if (projectTemplate.wbsElementTemplate.dateDeleted) {
      throw new DeletedException('Project Template', projectTemplateId);
    }

    return projectTemplateTransformer(projectTemplate);
  }

  /**
   * Create a single project template
   * @param creator the user creating the project template
   * @param templateName the name of the project template
   * @param templateNotes notes about the project template
   * @param descriptionBullets description bullets for the project
   * @param organization the organization to create the project template in
   * @param workPackageTemplates inputs to create work package templates under the project template
   * @param teamIds the ids of the teams to connect to the project template
   * @param summary summary of the project
   * @param budget budget of the project
   * @param projectName name for the project
   * @returns the created project template
   */
  static async createProjectTemplate(
    creator: User,
    templateName: string,
    templateNotes: string,
    descriptionBullets: DescriptionBulletPreview[],
    organization: Organization,
    workPackageTemplates: WorkPackageTemplateApiInputs[],
    teamIds: string[],
    summary?: string,
    budget?: number,
    projectName?: string
  ) {
    if (!(await userHasPermission(creator.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create project template');
    }

    await validateDescriptionBullets(descriptionBullets, organization.organizationId);

    const createdProjectTemplate = await prisma.project_Template.create({
      data: {
        wbsElementTemplate: {
          create: {
            templateName,
            templateNotes,
            wbsElementName: projectName ? projectName : undefined,
            userCreated: { connect: { userId: creator.userId } },
            organization: { connect: { organizationId: organization.organizationId } }
          }
        },
        budget: budget ?? undefined,
        teams: {
          connect: teamIds.map((id) => ({ teamId: id }))
        },
        summary: summary ?? undefined
      },
      ...getProjectTemplateQueryArgs(organization.organizationId)
    });
    for (const workPackageTemplate of workPackageTemplates) {
      const createdWorkPackageTemplate = await this.createWorkPackageTemplate(
        creator,
        workPackageTemplate.templateName,
        workPackageTemplate.templateNotes,
        workPackageTemplate.workPackageName ? workPackageTemplate.workPackageName : null,
        workPackageTemplate.stage === 'NONE' || !workPackageTemplate.stage ? null : workPackageTemplate.stage,
        workPackageTemplate.duration ?? null,
        workPackageTemplate.descriptionBullets,
        workPackageTemplate.blockedBy,
        organization,
        workPackageTemplate.workPackageTemplateId
      );

      await prisma.project_Template.update({
        where: { wbsElementTemplateId: createdProjectTemplate.wbsElementTemplateId },
        data: {
          workPackageTemplates: {
            connect: { wbsElementTemplateId: createdWorkPackageTemplate.workPackageTemplateId }
          }
        }
      });
    }

    await addRawDescriptionBullets(
      descriptionBullets,
      DescriptionBulletDestination.PROJECT_TEMPLATE,
      createdProjectTemplate.wbsElementTemplateId,
      organization.organizationId
    );

    return projectTemplateTransformer(createdProjectTemplate);
  }

  /**
   * Edit a project template
   * @param submitter the editor of the project template
   * @param projectTemplateId the id of the project template to edit
   * @param templateName the new name
   * @param templateNotes the new notes
   * @param workPackageTemplates the new work package templates
   * @param organization the organization to edit the project template in
   * @param teamIds the ids of the teams to connect to the project template
   * @param projectName the new name of the project
   * @param budget the new budget
   * @param summary the new summary
   * @returns the updated project template
   */
  static async editProjectTemplate(
    submitter: User,
    projectTemplateId: string,
    templateName: string,
    templateNotes: string,
    workPackageTemplates: WorkPackageTemplateApiInputs[],
    descriptionBullets: DescriptionBulletPreview[],
    organization: Organization,
    teamIds: string[],
    projectName?: string,
    budget?: number,
    summary?: string
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('edit a project template');
    }

    const foundProjectTemplate = await prisma.project_Template.findUnique({
      where: {
        wbsElementTemplateId: projectTemplateId,
        wbsElementTemplate: { dateDeleted: null, organizationId: organization.organizationId }
      },
      ...getProjectTemplateQueryArgs(organization.organizationId)
    });

    if (
      !foundProjectTemplate ||
      foundProjectTemplate.wbsElementTemplate.dateDeleted ||
      foundProjectTemplate.wbsElementTemplate.organizationId !== organization.organizationId
    ) {
      throw new NotFoundException('Project Template', projectTemplateId);
    }

    const existingWorkPackageTemplates = await prisma.work_Package_Template.findMany({
      where: { projectTemplateId, wbsElementTemplate: { dateDeleted: null } }
    });

    const existingWorkPackageTemplateIds = existingWorkPackageTemplates.map((template) => template.wbsElementTemplateId);
    const workPackageTemplateIds = workPackageTemplates.map((template) => template.workPackageTemplateId!);

    const templatesToCreate = workPackageTemplates.filter(
      (template) => !existingWorkPackageTemplateIds.includes(template.workPackageTemplateId!)
    );
    const templatesToUpdate = workPackageTemplates.filter((template) =>
      existingWorkPackageTemplateIds.includes(template.workPackageTemplateId!)
    );
    const templateIdsToDelete = existingWorkPackageTemplateIds.filter((id) => !workPackageTemplateIds.includes(id));

    for (const template of templatesToCreate) {
      await this.createWorkPackageTemplate(
        submitter,
        template.templateName,
        template.templateNotes,
        template.workPackageName ? template.workPackageName : null,
        template.stage === 'NONE' || !template.stage ? null : template.stage,
        template.duration ?? null,
        template.descriptionBullets,
        template.blockedBy,
        organization,
        template.workPackageTemplateId
      );
    }

    for (const template of templatesToUpdate) {
      await this.editWorkPackageTemplate(
        submitter,
        template.workPackageTemplateId!,
        template.templateName,
        template.templateNotes,
        template.duration ?? null,
        template.stage === 'NONE' || !template.stage ? null : template.stage,
        template.blockedBy,
        template.descriptionBullets,
        template.workPackageName ?? null,
        organization
      );
    }

    for (const templateId of templateIdsToDelete) {
      await this.deleteWorkPackageTemplate(submitter, templateId, organization);
    }

    // Disconnect all existing teams before connecting the new ones
    await prisma.project_Template.update({
      where: { wbsElementTemplateId: projectTemplateId },
      data: {
        teams: {
          set: []
        }
      }
    });

    const updatedProjectTemplate = await prisma.project_Template.update({
      where: { wbsElementTemplateId: projectTemplateId },
      data: {
        wbsElementTemplate: {
          update: {
            templateName,
            templateNotes,
            wbsElementName: projectName ?? null
          }
        },
        workPackageTemplates: {
          connect: workPackageTemplateIds.map((id) => ({ wbsElementTemplateId: id }))
        },
        budget: budget ?? null,
        teams: {
          connect: teamIds.map((id) => ({ teamId: id }))
        },
        summary: summary ?? null
      },
      ...getProjectTemplateQueryArgs(organization.organizationId)
    });

    await editDescriptionBullets(descriptionBullets, organization.organizationId);

    return projectTemplateTransformer(updatedProjectTemplate);
  }
}
