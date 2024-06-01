import { User } from '@prisma/client';
import { DescriptionBulletPreview, isAdmin, isGuest, WorkPackageStage, WorkPackageTemplate } from 'shared';
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
import { workPackageTemplateTransformer } from '../transformers/work-package-template.transformer';
import { getWorkPackageTemplateQueryArgs } from '../prisma-query-args/work-package-template.query-args';
import { getDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args';
import { userHasPermission } from '../utils/users.utils';

/** Service layer containing logic for work package controller functions. */
export default class WorkPackageTemplatesService {
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
    organizationId: string
  ): Promise<WorkPackageTemplate> {
    if (await userHasPermission(submitter.userId, organizationId, isGuest)) {
      throw new AccessDeniedGuestException('get a work package template');
    }

    const template = await prisma.work_Package_Template.findFirst({
      where: {
        workPackageTemplateId
      },
      ...getWorkPackageTemplateQueryArgs(organizationId)
    });

    if (!template) throw new HttpException(400, `Work package template with id ${workPackageTemplateId} not found`);

    if (template.organizationId !== organizationId) throw new InvalidOrganizationException('Work Package Template');

    return workPackageTemplateTransformer(template);
  }

  /**
   * Gets all work package templates
   * @param submitter  - the user making the request to get all work package templates
   * @param organizationId - the id of the organization to get all work package templates for
   * @returns an array of all work package templates
   */
  static async getAllWorkPackageTemplates(submitter: User, organizationId: string): Promise<WorkPackageTemplate[]> {
    if (await userHasPermission(submitter.userId, organizationId, isGuest)) {
      throw new AccessDeniedGuestException('get all work package templates.');
    }

    const workPackageTemplates = await prisma.work_Package_Template.findMany({
      where: { dateDeleted: null, organizationId },
      ...getWorkPackageTemplateQueryArgs(organizationId)
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
   * @returns the created work package template
   * @throws if the work package template could not be created
   */
  static async createWorkPackageTemplate(
    user: User,
    templateName: string,
    templateNotes: string,
    workPackageName: string | null,
    stage: WorkPackageStage | null,
    duration: number,
    descriptionBullets: DescriptionBulletPreview[],
    blockedByIds: string[],
    organizationId: string
  ): Promise<WorkPackageTemplate> {
    if (!(await userHasPermission(user.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create work package templates');

    // get the corresponding IDs of all work package templates in BlockedBy,
    // and throw an errror if the template doesn't exist
    await Promise.all(
      blockedByIds.map(async (workPackageTemplateId) => {
        const template = await prisma.work_Package_Template.findFirst({
          where: { workPackageTemplateId }
        });

        if (!template) {
          throw new NotFoundException('Work Package Template', workPackageTemplateId);
        }
        return template.workPackageTemplateId;
      })
    );

    await validateDescriptionBullets(descriptionBullets, organizationId);

    // add to the db
    const created = await prisma.work_Package_Template.create({
      data: {
        templateName,
        templateNotes,
        workPackageName,
        stage,
        duration,
        userCreatedId: user.userId,
        organizationId,
        blockedBy: {
          connect: blockedByIds.map((blockedById) => ({ workPackageTemplateId: blockedById }))
        }
      },

      ...getWorkPackageTemplateQueryArgs(organizationId)
    });

    await addRawDescriptionBullets(
      descriptionBullets,
      DescriptionBulletDestination.TEMPLATE,
      created.workPackageTemplateId,
      created.organizationId
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
    duration: number | undefined,
    stage: WorkPackageStage | undefined,
    blockedByIds: string[],
    descriptionBullets: DescriptionBulletPreview[],
    workPackageName: string | undefined,
    organizationId: string
  ): Promise<WorkPackageTemplate> {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('edit work package templates');

    const originalWorkPackageTemplate = await prisma.work_Package_Template.findUnique({
      where: { workPackageTemplateId },
      include: { blockedBy: true, descriptionBullets: getDescriptionBulletQueryArgs(organizationId) }
    });

    if (!originalWorkPackageTemplate) throw new NotFoundException('Work Package Template', workPackageTemplateId);
    if (originalWorkPackageTemplate.dateDeleted) throw new DeletedException('Work Package Template', workPackageTemplateId);
    if (originalWorkPackageTemplate.organizationId !== organizationId)
      throw new InvalidOrganizationException('Work Package Template');

    await validateBlockedByTemplates(blockedByIds, workPackageTemplateId);

    // only care about getting the deleted, added, edited description bullets
    const descriptionBulletsChanges = createListChanges(
      '',
      descriptionBulletsToChangeListValues(originalWorkPackageTemplate.descriptionBullets),
      descriptionBullets.map(descriptionBulletToChangeListValue),
      '',
      '',
      ''
    );

    const updatedWorkPackageTemplate = await prisma.work_Package_Template.update({
      where: {
        workPackageTemplateId
      },
      data: {
        templateName,
        templateNotes,
        duration,
        stage,
        workPackageName,
        blockedBy: {
          set: [], // remove all the connections then add all the given ones
          connect: blockedByIds.map((blockedById) => ({ workPackageTemplateId: blockedById }))
        }
      },
      ...getWorkPackageTemplateQueryArgs(organizationId)
    });

    await editDescriptionBullets(descriptionBulletsChanges.editedElements, originalWorkPackageTemplate.organizationId);

    await addRawDescriptionBullets(
      descriptionBulletsChanges.addedElements,
      DescriptionBulletDestination.TEMPLATE,
      updatedWorkPackageTemplate.workPackageTemplateId,
      updatedWorkPackageTemplate.organizationId
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
    organizationId: string
  ): Promise<void> {
    // Verify submitter is allowed to delete work packages
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete work package template');

    const workPackageTemplate = await prisma.work_Package_Template.findUnique({
      where: {
        workPackageTemplateId
      },
      include: {
        blocking: true
      }
    });

    if (!workPackageTemplate) {
      throw new NotFoundException('Work Package Template', workPackageTemplateId);
    }

    if (workPackageTemplate.dateDeleted) {
      throw new DeletedException('Work Package Template', workPackageTemplateId);
    }

    if (workPackageTemplate.organizationId !== organizationId) {
      throw new InvalidOrganizationException('Work Package Template');
    }

    const dateDeleted = new Date();

    if (workPackageTemplate.blocking.length > 0) {
      await deleteBlockingTemplates(workPackageTemplate, submitter);
    }

    // Soft delete the work package template by updating its related "deleted" fields
    await prisma.work_Package_Template.update({
      where: {
        workPackageTemplateId
      },
      data: {
        dateDeleted,
        userDeleted: {
          connect: {
            userId: submitter.userId
          }
        }
      }
    });
  }
}
