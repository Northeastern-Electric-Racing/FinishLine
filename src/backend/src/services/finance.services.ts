import {
  CreateSponsorTask,
  isAdmin,
  isHead,
  ReimbursementRequestData,
  SpendingBarData,
  Sponsor,
  SponsorTask,
  SponsorTier
} from 'shared';
import { User, Organization, Sponsor_Task } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import {
  getSponsorQueryArgs,
  getSponsorTaskQueryArgs,
  getSponsorTierQueryArgs
} from '../prisma-query-args/sponsor.query.args';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import { sponsorTransformer } from '../transformers/finance.transformer';
import sponsorTaskTransformer from '../transformers/sponsor-task.transformer';
import {
  getAllReimbursementRequestData,
  getAllSpendingBarData,
  getReimbursementRequestCategoryData,
  getReimbursementRequestsByDivision,
  getReimbursementRequestsByProject,
  getReimbursementRequestsByTeam,
  getSpendingBarCategoryData,
  getSpendingBarDataForProjectBudgetByDivision,
  getSpendingBarDataForProjectBudgetByTeam
} from '../utils/finance.utils';
import { notifySponsorTaskAssignee } from '../utils/slack.utils';

export default class FinanceServices {
  /**
   * Creates a new sponsor for the given organization and assigns associated tasks.
   *
   * @param submitter The user submitting the request, who must have appropriate permissions to create a sponsor.
   * @param name The name of the sponsor.
   * @param activeStatus The status indicating whether the sponsor is active or not.
   * @param sponsorValue The financial value associated with the sponsor.
   * @param joinDate The date when the sponsor joins.
   * @param activeYears An array of years indicating the sponsor's active period.
   * @param sponsorTierId The ID of the sponsor's tier.
   * @param taxExempt Boolean indicating if the sponsor is tax-exempt.
   * @param discountCode The discount code associated with the sponsor.
   * @param sponsorContact The contact information for the sponsor.
   * @param sponsorTasks An array of sponsor tasks associated with the sponsor.
   * @param organization The organization for which the sponsor is being created.
   *
   * @returns The created sponsor object, including associated tasks.
   *
   * @throws AccessDeniedAdminOnlyException If the submitter does not have permission to create a sponsor.
   */
  static async createSponsor(
    submitter: User,
    name: string,
    activeStatus: boolean,
    sponsorValue: number,
    joinDate: Date,
    activeYears: number[],
    sponsorTierId: string,
    taxExempt: boolean,
    sponsorContact: string,
    sponsorTasks: CreateSponsorTask[],
    organization: Organization,
    discountCode?: string
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only heads can create a sponsor');

    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        name,
        organizationId: organization.organizationId
      }
    });

    if (existingSponsor) {
      throw new HttpException(400, `A sponsor with the name "${name}" already exists.`);
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        activeStatus,
        sponsorValue,
        joinDate,
        activeYears,
        sponsorTierId,
        taxExempt,
        discountCode,
        vendorContact: sponsorContact,
        sponsorTasks: {
          create: sponsorTasks.map((task) => ({
            dueDate: task.dueDate,
            notifyDate: task.notifyDate,
            assigneeUserId: task.assigneeUserId,
            notes: task.notes
          }))
        },
        organizationId: organization.organizationId
      },
      ...getSponsorQueryArgs(organization.organizationId)
    });

    sponsorTasks.forEach(async (sponsorTask) => {
      if (!sponsorTask.assigneeUserId) return;

      const assignee = await prisma.user.findUnique({
        where: { userId: sponsorTask.assigneeUserId },
        include: { userSettings: true }
      });
      if (!assignee) return;

      await notifySponsorTaskAssignee(assignee, sponsorTask, sponsor.name);
    });

    return sponsorTransformer(sponsor);
  }

  /**
   * Returns all the sponsors in the database
   * @param organization The organization the user is currently in
   * @returns All the sponsors in the database
   */
  static async getAllSponsors(organization: Organization) {
    const allSponsors = await prisma.sponsor.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      ...getSponsorQueryArgs(organization.organizationId)
    });

    return allSponsors.map(sponsorTransformer);
  }

  /**
   * Soft deletes a given sponsor
   * @param sponsorId the id of the sponsor that is getting deleted
   * @param deleter the person deleting the sponsor
   * @param organization the organization the person deleting belongs to
   * @returns the deleted sponsor
   */
  static async deleteSponsor(sponsorId: string, deleter: User, organization: Organization): Promise<Sponsor> {
    const sponsor = await prisma.sponsor.findUnique({
      where: {
        sponsorId
      }
    });

    if (!(await userHasPermission(deleter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads can delete sponsors.');
    }

    if (!sponsor) throw new NotFoundException('Sponsor', sponsorId);
    if (sponsor.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Sponsor');
    if (sponsor.dateDeleted) throw new DeletedException('Sponsor', sponsorId);

    const deletedSponsor = await prisma.sponsor.update({
      where: { sponsorId },
      data: { dateDeleted: new Date() },
      ...getSponsorQueryArgs(organization.organizationId)
    });

    return sponsorTransformer(deletedSponsor);
  }

  /**
   * Creates a sponsor tier.
   * @param submitter current user creating the sponsor tier
   * @param name tier name
   * @param organization current organization of the current user
   * @param colorHexCode tier color
   * @param minSupportValue minimum support value for the tier
   * @returns newly created sponsor tier
   */
  static async createSponsorTier(
    submitter: User,
    name: string,
    organization: Organization,
    colorHexCode: string,
    minSupportValue: number
  ): Promise<SponsorTier> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only heads can create a sponsor tier');

    const sponsorTier = await prisma.sponsor_Tier.create({
      data: {
        name,
        organizationId: organization.organizationId,
        colorHexCode,
        minSupportValue
      },
      include: {
        organization: true
      }
    });

    return sponsorTier;
  }

  /**
   * Edits a sponsor task
   * @param submitter the user submitting
   * @param org the org of the submitter
   * @param sponsorTaskId the id of the sponsor task we are updating
   * @param dueDate the updated dueDate
   * @param notifyDate the updated notify date
   * @param assignee the updated assignee
   * @param notes the updated notes
   * @returns the updated sponsorTask
   */

  static async editSponsorTask(
    submitter: User,
    org: Organization,
    sponsorTaskId: string,
    dueDate: Date,
    notes: string,
    notifyDate?: Date,
    assigneeUserId?: string
  ): Promise<Sponsor_Task> {
    if (!(await userHasPermission(submitter.userId, org.organizationId, isHead)))
      throw new AccessDeniedException('Only heads can edit sponsor tasks.');

    const oldSponsorTask = await prisma.sponsor_Task.findUnique({
      where: {
        sponsorTaskId,
        sponsor: {
          organizationId: org.organizationId
        }
      }
    });

    if (!oldSponsorTask) throw new NotFoundException('SponsorTask', sponsorTaskId);

    let assignee;

    if (assigneeUserId) {
      assignee = await prisma.user.findUnique({
        where: {
          userId: assigneeUserId,
          organizations: {
            some: {
              organizationId: org.organizationId
            }
          }
        },
        include: { userSettings: true }
      });

      if (!assignee) {
        throw new NotFoundException('User', assigneeUserId);
      }
    }

    const updatedSponsorTask = await prisma.sponsor_Task.update({
      where: { sponsorTaskId: oldSponsorTask.sponsorTaskId },
      data: {
        notifyDate,
        assigneeUserId,
        dueDate,
        notes
      }
    });

    if (assignee && oldSponsorTask.assigneeUserId !== assigneeUserId) {
      const sponsor = await prisma.sponsor.findUnique({
        where: { sponsorId: updatedSponsorTask.sponsorId }
      });

      if (!sponsor) {
        throw new NotFoundException('Sponsor', updatedSponsorTask.sponsorId);
      }

      if (assignee) {
        await notifySponsorTaskAssignee(assignee, updatedSponsorTask, sponsor.name);
      }
    }

    return updatedSponsorTask;
  }

  /*
   * Gets the sponsor tasks for the given sponsor Id
   * @param sponsorId the id of the sponsor these tasks are tied to
   * @param organizationId the organization the user is in
   * @returns all the sponsor tasks for the sponsor
   */
  static async getSponsorTasks(sponsorId: string, organizationId: string) {
    const sponsor = await prisma.sponsor.findUnique({
      where: { dateDeleted: null, sponsorId },
      ...getSponsorQueryArgs(organizationId)
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor', sponsorId);
    }

    const sponsorTasks = await prisma.sponsor_Task.findMany({
      where: {
        sponsorId,
        dateDeleted: null
      },
      ...getSponsorTaskQueryArgs(organizationId)
    });

    return sponsorTasks.map(sponsorTaskTransformer);
  }

  /**
   * Soft deletes the sponsor task with the given id.
   * @param sponsorTaskId id of the sponsor task to delete
   * @param deleter user submitting the delete request
   * @param organization current organization
   * @returns the deleted sponsor task
   */
  static async deleteSponsorTask(sponsorTaskId: string, deleter: User, organization: Organization) {
    const sponsorTask = await prisma.sponsor_Task.findUnique({
      where: { sponsorTaskId, dateDeleted: null }
    });

    if (!(await userHasPermission(deleter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads can delete sponsor tasks.');
    }

    if (!sponsorTask) throw new NotFoundException('SponsorTask', sponsorTaskId);

    const deletedSponsorTask = await prisma.sponsor_Task.update({
      where: { sponsorTaskId },
      data: { dateDeleted: new Date() }
    });

    return deletedSponsorTask;
  }

  /**
   * Creates a sponsor task for the given sponsorId.
   * @param submitter current user creating the sponsor task
   * @param organization current organization of the user
   * @param dueDate sponsor task's due date
   * @param notes notes for the sponsor task
   * @param sponsorId the sponsor associated with this sponsor task
   * @param notifyDate notification date for this sponsor tasks
   * @param assigneeUserId assignee of this sponsor task
   * @returns newly created sponsor task, and the given sponsor updated with this sponsor task added
   * @throws AccessDeniedAdminOnlyException if the user lacks permissions.
   * @throws NotFoundException if the sponsor or assignee is not found.
   * @throws DeletedException if the sponsor is marked as deleted.
   */
  static async createSponsorTask(
    submitter: User,
    organization: Organization,
    dueDate: Date,
    notes: string,
    sponsorId: string,
    notifyDate?: Date,
    assigneeUserId?: string
  ): Promise<SponsorTask> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads can create a sponsor task');
    }

    const sponsor = await prisma.sponsor.findUnique({ where: { sponsorId, organizationId: organization.organizationId } });
    if (!sponsor) throw new NotFoundException('Sponsor', sponsorId);
    if (sponsor.dateDeleted) throw new DeletedException('Sponsor', sponsorId);

    if (assigneeUserId) {
      const assignee = await prisma.user.findUnique({ where: { userId: assigneeUserId } });
      if (!assignee) throw new NotFoundException('User', assigneeUserId);
    }

    const createdSponsorTask = await prisma.sponsor_Task.create({
      data: {
        dueDate,
        notifyDate,
        assignee: assigneeUserId ? { connect: { userId: assigneeUserId } } : undefined,
        notes,
        sponsor: { connect: { sponsorId } }
      },
      ...getSponsorTaskQueryArgs(organization.organizationId)
    });

    if (createdSponsorTask.assigneeUserId) {
      const assignee = await prisma.user.findUnique({
        where: { userId: createdSponsorTask.assigneeUserId },
        include: { userSettings: true }
      });
      if (!assignee) throw new NotFoundException('User', createdSponsorTask.assigneeUserId);

      await notifySponsorTaskAssignee(assignee, createdSponsorTask, sponsor.name);
    }

    return sponsorTaskTransformer(createdSponsorTask);
  }

  static async getReimbursementRequestProjectData(
    organization: Organization,
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReimbursementRequestData> {
    return await getReimbursementRequestsByProject(projectId, organization.organizationId, startDate, endDate);
  }

  static async getReimbursementRequestTeamData(
    organization: Organization,
    teamId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReimbursementRequestData> {
    return await getReimbursementRequestsByTeam(teamId, organization.organizationId, startDate, endDate);
  }

  static async getReimbursementRequestTeamTypeData(
    organization: Organization,
    teamTypeId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReimbursementRequestData> {
    return await getReimbursementRequestsByDivision(teamTypeId, organization.organizationId, startDate, endDate);
  }

  static async getSpendingBarTeamData(
    organization: Organization,
    teamId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpendingBarData> {
    return await getSpendingBarDataForProjectBudgetByTeam(teamId, organization.organizationId, startDate, endDate);
  }

  static async getSpendingBarTeamTypeData(
    organization: Organization,
    teamTypeId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpendingBarData[]> {
    return await getSpendingBarDataForProjectBudgetByDivision(teamTypeId, organization.organizationId, startDate, endDate);
  }

  static async getAllReimbursementRequestData(
    organization: Organization,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReimbursementRequestData[]> {
    return await getAllReimbursementRequestData(organization.organizationId, startDate, endDate);
  }

  static async getReimbursementRequestCategoryData(
    otherReasonId: string,
    organization: Organization,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReimbursementRequestData> {
    return await getReimbursementRequestCategoryData(otherReasonId, organization.organizationId, startDate, endDate);
  }

  static async getAllSpendingBarData(
    organization: Organization,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpendingBarData[]> {
    return await getAllSpendingBarData(organization.organizationId, startDate, endDate);
  }

  static async getSpendingBarCategoryData(organization: Organization): Promise<SpendingBarData> {
    return await getSpendingBarCategoryData(organization.organizationId);
  }

  /**
   * Edits a sponsor.
   * @param submitter The user submitting the request, who must have appropriate permissions to create a sponsor.
   * @param sponsorId the id of the sponsor to be edited
   * @param name The name of the sponsor.
   * @param activeStatus The status indicating whether the sponsor is active or not.
   * @param sponsorValue The financial value associated with the sponsor.
   * @param joinDate The date when the sponsor joins.
   * @param activeYears An array of years indicating the sponsor's active period.
   * @param sponsorTierId The ID of the sponsor's tier.
   * @param taxExempt Boolean indicating if the sponsor is tax-exempt.
   * @param discountCode The discount code associated with the sponsor.
   * @param sponsorContact The contact information for the sponsor.
   * @param sponsorTasks An array of sponsor tasks associated with the sponsor.
   * @param organization The organization for which the sponsor is being edited.
   * @returns the edited sponsor.
   */

  static async editSponsor(
    submitter: User,
    organization: Organization,
    sponsorId: string,
    name: string,
    activeStatus: boolean,
    sponsorValue: number,
    joinDate: Date,
    activeYears: number[],
    sponsorTierId: string,
    sponsorContact: string,
    taxExempt: boolean,
    sponsorTasks: CreateSponsorTask[],
    discountCode?: string
  ): Promise<Sponsor> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only heads can edit sponsors.');

    const oldSponsor = await prisma.sponsor.findUnique({
      where: {
        sponsorId,
        organizationId: organization.organizationId
      },
      include: {
        sponsorTasks: true
      }
    });

    if (!oldSponsor) throw new NotFoundException('Sponsor', sponsorId);

    await Promise.all(
      oldSponsor.sponsorTasks.map((t) =>
        prisma.sponsor_Task.deleteMany({
          where: {
            sponsorTaskId: t.sponsorTaskId
          }
        })
      )
    );

    const tier = await prisma.sponsor_Tier.findUnique({
      where: {
        sponsorTierId,
        organizationId: organization.organizationId
      }
    });

    if (!tier) throw new NotFoundException('Sponsor Tier', sponsorTierId);

    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        name,
        organizationId: organization.organizationId
      }
    });

    if (existingSponsor) {
      throw new HttpException(400, `A sponsor with the name "${name}" already exists.`);
    }

    const updatedSponsor = await prisma.sponsor.update({
      where: { sponsorId: oldSponsor.sponsorId },
      data: {
        name,
        activeStatus,
        sponsorValue,
        joinDate,
        activeYears,
        tier: {
          connect: { sponsorTierId }
        },
        sponsorTasks: {
          connect: await Promise.all(
            sponsorTasks.map(async (t) => {
              const createdTask = await this.createSponsorTask(
                submitter,
                organization,
                t.dueDate,
                t.notes,
                sponsorId,
                t.notifyDate,
                t.assigneeUserId
              );
              return { sponsorTaskId: createdTask.sponsorTaskId };
            })
          )
        },
        vendorContact: sponsorContact,
        taxExempt,
        discountCode
      },
      ...getSponsorQueryArgs(organization.organizationId)
    });

    return sponsorTransformer(updatedSponsor);
  }

  /**
   * Gets all sponsor tiers
   * @param organization organization sponsor tiers belong to
   * @returns all sponsor tiers
   */
  static async getAllSponsorTiers(organization: Organization): Promise<SponsorTier[]> {
    const allSponsorTiers = await prisma.sponsor_Tier.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      orderBy: { minSupportValue: 'asc' },
      ...getSponsorTierQueryArgs(organization.organizationId)
    });

    return allSponsorTiers;
  }

  /**
   * Soft deletes a given sponsor tier
   * @param sponsorTierId the id of the sponsor tier that is getting deleted
   * @param deleter the person deleting the sponsor tier
   * @param organization the organization the person deleting belongs to
   * @returns the deleted sponsor tier
   */
  static async deleteSponsorTier(sponsorTierId: string, deleter: User, organization: Organization): Promise<SponsorTier> {
    const sponsorTier = await prisma.sponsor_Tier.findUnique({
      where: { sponsorTierId }
    });

    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete a sponsor tier');
    }

    if (!sponsorTier) throw new NotFoundException('Sponsor Tier', sponsorTierId);
    if (sponsorTier.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Sponsor Tier');
    if (sponsorTier.dateDeleted) throw new DeletedException('Sponsor Tier', sponsorTierId);

    const associatedSponsors = await prisma.sponsor.count({
      where: { sponsorTierId: sponsorTier.sponsorTierId, dateDeleted: null }
    });

    if (associatedSponsors > 0) {
      throw new HttpException(
        400,
        `Cannot delete Sponsor Tier "${sponsorTier.name}" because it is associated with existing sponsors.`
      );
    }

    const deletedSponsorTier = await prisma.sponsor_Tier.update({
      where: { sponsorTierId },
      data: { dateDeleted: new Date(), deleter: { connect: { userId: deleter.userId } } },
      ...getSponsorTierQueryArgs(organization.organizationId)
    });

    return deletedSponsorTier;
  }

  /**
   * Edits a sponsor tier.
   * @param submitter current user editing the sponsor tier
   * @param organization current organization of the current user
   * @param sponsorTierId id of the sponsor tier to be edited
   * @param name updated tier name
   * @param colorHexCode updated tier color
   * @param minSupportValue updated minimum support value for the tier
   * @returns the updated sponsor tier
   * @throws AccessDeniedAdminOnlyException if the user lacks permissions.
   * @throws NotFoundException if the sponsor tier is not found.
   */
  static async editSponsorTier(
    submitter: User,
    organization: Organization,
    sponsorTierId: string,
    name: string,
    colorHexCode: string,
    minSupportValue: number
  ): Promise<SponsorTier> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('edit a sponsor tier');

    const oldSponsorTier = await prisma.sponsor_Tier.findUnique({
      where: {
        sponsorTierId,
        organizationId: organization.organizationId
      }
    });

    if (!oldSponsorTier) throw new NotFoundException('Sponsor Tier', sponsorTierId);
    if (oldSponsorTier.dateDeleted) throw new DeletedException('Sponsor Tier', sponsorTierId);

    const updatedSponsorTier = await prisma.sponsor_Tier.update({
      where: { sponsorTierId: oldSponsorTier.sponsorTierId },
      data: {
        name,
        colorHexCode,
        minSupportValue
      },
      ...getSponsorTierQueryArgs(organization.organizationId)
    });

    return updatedSponsorTier;
  }
}
