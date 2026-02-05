import {
  FirstContactMethod,
  isHead,
  ProspectiveSponsor,
  ProspectiveSponsorStatus,
  SponsorTask,
  User
} from 'shared';
import { Organization, Prospective_Sponsor_Status } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils.js';
import { getProspectiveSponsorQueryArgs } from '../prisma-query-args/prospective-sponsor.query-args.js';
import { getSponsorTaskQueryArgs } from '../prisma-query-args/sponsor.query.args.js';
import {
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import prisma from '../prisma/prisma.js';
import { prospectiveSponsorTransformer } from '../transformers/prospective-sponsor.transformer.js';
import { sponsorTaskTransformer } from '../transformers/sponsor-task.transformer.js';
import { notifySponsorTaskAssignee } from '../utils/slack.utils.js';
import { isUserFinanceTeamOrHead } from '../utils/reimbursement-requests.utils.js';

export default class ProspectiveSponsorServices {
  /**
   * Creates a new prospective sponsor for the given organization.
   */
  static async createProspectiveSponsor(
    submitter: User,
    organization: Organization,
    organizationName: string,
    lastContactDate: Date,
    firstContactMethod: FirstContactMethod,
    contactName: string,
    contactorUserId: string,
    highlightThresholdDays?: number,
    contactEmail?: string,
    contactPhone?: string,
    contactPosition?: string
  ): Promise<ProspectiveSponsor> {
    if (!(await isUserFinanceTeamOrHead(submitter, organization.organizationId))) {
      throw new AccessDeniedException('Only finance team members or heads can create prospective sponsors');
    }

    const existingProspectiveSponsor = await prisma.prospective_Sponsor.findFirst({
      where: {
        organizationName: { equals: organizationName, mode: 'insensitive' },
        organizationId: organization.organizationId,
        dateDeleted: null
      }
    });

    if (existingProspectiveSponsor) {
      throw new HttpException(400, `A prospective sponsor with the name "${organizationName}" already exists.`);
    }

    const contactor = await prisma.user.findUnique({
      where: { userId: contactorUserId }
    });

    if (!contactor) {
      throw new NotFoundException('User', contactorUserId);
    }

    const prospectiveSponsor = await prisma.prospective_Sponsor.create({
      data: {
        organizationName,
        lastContactDate,
        highlightThresholdDays: highlightThresholdDays ?? 10,
        firstContactMethod,
        contactorUserId,
        contactName,
        contactEmail,
        contactPhone,
        contactPosition,
        organizationId: organization.organizationId
      },
      ...getProspectiveSponsorQueryArgs(organization.organizationId)
    });

    return prospectiveSponsorTransformer(prospectiveSponsor);
  }

  /**
   * Returns all prospective sponsors for the organization.
   */
  static async getAllProspectiveSponsors(organization: Organization): Promise<ProspectiveSponsor[]> {
    const prospectiveSponsors = await prisma.prospective_Sponsor.findMany({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null
      },
      ...getProspectiveSponsorQueryArgs(organization.organizationId)
    });

    return prospectiveSponsors.map(prospectiveSponsorTransformer);
  }

  /**
   * Edits a prospective sponsor.
   */
  static async editProspectiveSponsor(
    submitter: User,
    organization: Organization,
    prospectiveSponsorId: string,
    organizationName: string,
    lastContactDate: Date,
    status: ProspectiveSponsorStatus,
    firstContactMethod: FirstContactMethod,
    contactName: string,
    contactorUserId: string,
    highlightThresholdDays?: number,
    contactEmail?: string,
    contactPhone?: string,
    contactPosition?: string
  ): Promise<ProspectiveSponsor> {
    if (!(await isUserFinanceTeamOrHead(submitter, organization.organizationId))) {
      throw new AccessDeniedException('Only finance team members or heads can edit prospective sponsors');
    }

    const oldProspectiveSponsor = await prisma.prospective_Sponsor.findUnique({
      where: { prospectiveSponsorId, organizationId: organization.organizationId }
    });

    if (!oldProspectiveSponsor) throw new NotFoundException('ProspectiveSponsor', prospectiveSponsorId);
    if (oldProspectiveSponsor.dateDeleted) throw new DeletedException('ProspectiveSponsor', prospectiveSponsorId);

    if (organizationName !== oldProspectiveSponsor.organizationName) {
      const existingProspectiveSponsor = await prisma.prospective_Sponsor.findFirst({
        where: {
          organizationName: { equals: organizationName, mode: 'insensitive' },
          organizationId: organization.organizationId,
          dateDeleted: null
        }
      });

      if (existingProspectiveSponsor) {
        throw new HttpException(400, `A prospective sponsor with the name "${organizationName}" already exists.`);
      }
    }

    const contactor = await prisma.user.findUnique({
      where: { userId: contactorUserId }
    });

    if (!contactor) {
      throw new NotFoundException('User', contactorUserId);
    }

    const updatedProspectiveSponsor = await prisma.prospective_Sponsor.update({
      where: { prospectiveSponsorId },
      data: {
        organizationName,
        lastContactDate,
        highlightThresholdDays: highlightThresholdDays ?? 10,
        status,
        firstContactMethod,
        contactorUserId,
        contactName,
        contactEmail,
        contactPhone,
        contactPosition
      },
      ...getProspectiveSponsorQueryArgs(organization.organizationId)
    });

    return prospectiveSponsorTransformer(updatedProspectiveSponsor);
  }

  /**
   * Soft deletes a prospective sponsor.
   */
  static async deleteProspectiveSponsor(
    prospectiveSponsorId: string,
    deleter: User,
    organization: Organization
  ): Promise<ProspectiveSponsor> {
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads can delete prospective sponsors');
    }

    const prospectiveSponsor = await prisma.prospective_Sponsor.findUnique({
      where: { prospectiveSponsorId }
    });

    if (!prospectiveSponsor) throw new NotFoundException('ProspectiveSponsor', prospectiveSponsorId);
    if (prospectiveSponsor.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('ProspectiveSponsor');
    }
    if (prospectiveSponsor.dateDeleted) throw new DeletedException('ProspectiveSponsor', prospectiveSponsorId);

    const deletedProspectiveSponsor = await prisma.prospective_Sponsor.update({
      where: { prospectiveSponsorId },
      data: { dateDeleted: new Date() },
      ...getProspectiveSponsorQueryArgs(organization.organizationId)
    });

    return prospectiveSponsorTransformer(deletedProspectiveSponsor);
  }

  /**
   * Gets tasks for a prospective sponsor.
   */
  static async getProspectiveSponsorTasks(
    prospectiveSponsorId: string,
    organizationId: string
  ): Promise<SponsorTask[]> {
    const prospectiveSponsor = await prisma.prospective_Sponsor.findUnique({
      where: { prospectiveSponsorId, dateDeleted: null }
    });

    if (!prospectiveSponsor) throw new NotFoundException('ProspectiveSponsor', prospectiveSponsorId);

    const tasks = await prisma.sponsor_Task.findMany({
      where: {
        prospectiveSponsorId,
        dateDeleted: null
      },
      ...getSponsorTaskQueryArgs(organizationId)
    });

    return tasks.map(sponsorTaskTransformer);
  }

  /**
   * Creates a task for a prospective sponsor.
   */
  static async createProspectiveSponsorTask(
    submitter: User,
    organization: Organization,
    prospectiveSponsorId: string,
    dueDate: Date,
    notes: string,
    notifyDate?: Date,
    assigneeUserId?: string
  ): Promise<SponsorTask> {
    if (!(await isUserFinanceTeamOrHead(submitter, organization.organizationId))) {
      throw new AccessDeniedException('Only finance team members or heads can create prospective sponsor tasks');
    }

    const prospectiveSponsor = await prisma.prospective_Sponsor.findUnique({
      where: { prospectiveSponsorId, organizationId: organization.organizationId }
    });

    if (!prospectiveSponsor) throw new NotFoundException('ProspectiveSponsor', prospectiveSponsorId);
    if (prospectiveSponsor.dateDeleted) throw new DeletedException('ProspectiveSponsor', prospectiveSponsorId);

    if (assigneeUserId) {
      const assignee = await prisma.user.findUnique({ where: { userId: assigneeUserId } });
      if (!assignee) throw new NotFoundException('User', assigneeUserId);
    }

    const createdTask = await prisma.sponsor_Task.create({
      data: {
        dueDate,
        notifyDate,
        assigneeUserId,
        notes,
        prospectiveSponsorId
      },
      ...getSponsorTaskQueryArgs(organization.organizationId)
    });

    if (createdTask.assigneeUserId) {
      const assignee = await prisma.user.findUnique({
        where: { userId: createdTask.assigneeUserId },
        include: { userSettings: true }
      });
      if (assignee) {
        await notifySponsorTaskAssignee(assignee, createdTask, prospectiveSponsor.organizationName);
      }
    }

    return sponsorTaskTransformer(createdTask);
  }

  /**
   * Accepts a prospective sponsor and creates a full sponsor record.
   */
  static async acceptProspectiveSponsor(
    submitter: User,
    organization: Organization,
    prospectiveSponsorId: string,
    sponsorTierId: string,
    sponsorValue: number,
    joinDate: Date,
    activeYears: number[],
    taxExempt: boolean,
    discountCode?: string,
    sponsorNotes?: string
  ): Promise<ProspectiveSponsor> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads can accept prospective sponsors');
    }

    const prospectiveSponsor = await prisma.prospective_Sponsor.findUnique({
      where: { prospectiveSponsorId, organizationId: organization.organizationId }
    });

    if (!prospectiveSponsor) throw new NotFoundException('ProspectiveSponsor', prospectiveSponsorId);
    if (prospectiveSponsor.dateDeleted) throw new DeletedException('ProspectiveSponsor', prospectiveSponsorId);
    if (prospectiveSponsor.status === Prospective_Sponsor_Status.ACCEPTED) {
      throw new HttpException(400, 'This prospective sponsor has already been accepted');
    }

    const tier = await prisma.sponsor_Tier.findUnique({
      where: { sponsorTierId, organizationId: organization.organizationId }
    });

    if (!tier) throw new NotFoundException('SponsorTier', sponsorTierId);

    // Check if a sponsor with this name already exists
    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        name: { equals: prospectiveSponsor.organizationName, mode: 'insensitive' },
        organizationId: organization.organizationId,
        dateDeleted: null
      }
    });

    if (existingSponsor) {
      throw new HttpException(400, `A sponsor with the name "${prospectiveSponsor.organizationName}" already exists.`);
    }

    // Create the sponsor
    await prisma.sponsor.create({
      data: {
        name: prospectiveSponsor.organizationName,
        activeStatus: true,
        sponsorValue,
        joinDate,
        activeYears,
        sponsorTierId,
        taxExempt,
        discountCode,
        sponsorNotes,
        contactName: prospectiveSponsor.contactName,
        contactEmail: prospectiveSponsor.contactEmail,
        contactPhone: prospectiveSponsor.contactPhone,
        contactPosition: prospectiveSponsor.contactPosition,
        organizationId: organization.organizationId
      }
    });

    // Soft-delete the prospective sponsor since they're now a full sponsor
    const updatedProspectiveSponsor = await prisma.prospective_Sponsor.update({
      where: { prospectiveSponsorId },
      data: {
        status: Prospective_Sponsor_Status.ACCEPTED,
        dateDeleted: new Date()
      },
      ...getProspectiveSponsorQueryArgs(organization.organizationId)
    });

    return prospectiveSponsorTransformer(updatedProspectiveSponsor);
  }
}
