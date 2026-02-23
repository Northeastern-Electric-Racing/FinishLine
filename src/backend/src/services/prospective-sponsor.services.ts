import {
  CreateSponsorTask,
  FirstContactMethod,
  isHead,
  ProspectiveSponsor,
  ProspectiveSponsorStatus,
  SponsorTask,
  User
} from 'shared';
import { Organization, Prospective_Sponsor_Status, Sponsor_Value_Type } from '@prisma/client';
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
    status: ProspectiveSponsorStatus,
    lastContactDate?: Date,
    firstContactMethod?: FirstContactMethod,
    contactName?: string,
    contactorUserId?: string,
    highlightThresholdDays?: number,
    contactEmail?: string,
    contactPhone?: string,
    contactPosition?: string,
    notes?: string,
    tasks?: CreateSponsorTask[]
  ): Promise<ProspectiveSponsor> {
    if (!(await isUserFinanceTeamOrHead(submitter, organization.organizationId))) {
      throw new AccessDeniedException('Only finance team members or heads can create prospective sponsors');
    }

    const isNotInContact = status === ProspectiveSponsorStatus.NOT_IN_CONTACT;

    if (!isNotInContact) {
      if (!lastContactDate) throw new HttpException(400, 'Last contact date is required');
      if (!firstContactMethod) throw new HttpException(400, 'First contact method is required');
      if (!contactName) throw new HttpException(400, 'Contact name is required');
      if (!contactorUserId) throw new HttpException(400, 'Contactor is required');
      if (!contactEmail && !contactPhone) {
        throw new HttpException(400, 'At least one of contact email or contact phone is required');
      }
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

    if (contactorUserId) {
      const contactor = await prisma.user.findUnique({ where: { userId: contactorUserId } });
      if (!contactor) throw new NotFoundException('User', contactorUserId);
    }

    const contact =
      !isNotInContact && contactName
        ? await prisma.sponsor_Contact.create({
            data: { name: contactName, email: contactEmail, phone: contactPhone, position: contactPosition }
          })
        : null;

    const prospectiveSponsor = await prisma.prospective_Sponsor.create({
      data: {
        organizationName,
        lastContactDate: lastContactDate ?? null,
        highlightThresholdDays: highlightThresholdDays ?? 10,
        status,
        firstContactMethod: firstContactMethod ?? null,
        contactorUserId: contactorUserId ?? null,
        contactId: contact?.sponsorContactId ?? null,
        notes,
        organizationId: organization.organizationId,
        tasks: tasks?.length
          ? {
              create: tasks.map((task) => ({
                dueDate: task.dueDate,
                notifyDate: task.notifyDate,
                assigneeUserId: task.assigneeUserId,
                notes: task.notes
              }))
            }
          : undefined
      },
      ...getProspectiveSponsorQueryArgs(organization.organizationId)
    });

    if (tasks?.length) {
      tasks.forEach(async (task) => {
        if (!task.assigneeUserId) return;
        const assignee = await prisma.user.findUnique({
          where: { userId: task.assigneeUserId },
          include: { userSettings: true }
        });
        if (assignee) {
          await notifySponsorTaskAssignee(assignee, task, organizationName);
        }
      });
    }

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
    status: ProspectiveSponsorStatus,
    lastContactDate?: Date,
    firstContactMethod?: FirstContactMethod,
    contactName?: string,
    contactorUserId?: string,
    highlightThresholdDays?: number,
    contactEmail?: string,
    contactPhone?: string,
    contactPosition?: string,
    notes?: string,
    tasks?: CreateSponsorTask[]
  ): Promise<ProspectiveSponsor> {
    if (!(await isUserFinanceTeamOrHead(submitter, organization.organizationId))) {
      throw new AccessDeniedException('Only finance team members or heads can edit prospective sponsors');
    }

    const isNotInContact = status === ProspectiveSponsorStatus.NOT_IN_CONTACT;

    if (!isNotInContact) {
      if (!lastContactDate) throw new HttpException(400, 'Last contact date is required');
      if (!firstContactMethod) throw new HttpException(400, 'First contact method is required');
      if (!contactName) throw new HttpException(400, 'Contact name is required');
      if (!contactorUserId) throw new HttpException(400, 'Contactor is required');
      if (!contactEmail && !contactPhone) {
        throw new HttpException(400, 'At least one of contact email or contact phone is required');
      }
    }

    const oldProspectiveSponsor = await prisma.prospective_Sponsor.findUnique({
      where: { prospectiveSponsorId, organizationId: organization.organizationId },
      include: { tasks: true }
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

    if (contactorUserId) {
      const contactor = await prisma.user.findUnique({ where: { userId: contactorUserId } });
      if (!contactor) throw new NotFoundException('User', contactorUserId);
    }

    // Upsert tasks if provided
    if (tasks) {
      const incomingTaskIds = new Set(tasks.filter((t) => t.sponsorTaskId).map((t) => t.sponsorTaskId!));
      const tasksToDelete = oldProspectiveSponsor.tasks.filter((t) => !incomingTaskIds.has(t.sponsorTaskId));
      const tasksToUpdate = tasks.filter((t) => t.sponsorTaskId);
      const tasksToCreate = tasks.filter((t) => !t.sponsorTaskId);

      if (tasksToDelete.length > 0) {
        await prisma.sponsor_Task.deleteMany({
          where: { sponsorTaskId: { in: tasksToDelete.map((t) => t.sponsorTaskId) } }
        });
      }

      await Promise.all(
        tasksToUpdate.map((t) =>
          prisma.sponsor_Task.update({
            where: { sponsorTaskId: t.sponsorTaskId! },
            data: {
              dueDate: t.dueDate,
              notifyDate: t.notifyDate,
              assigneeUserId: t.assigneeUserId || null,
              notes: t.notes,
              done: t.done ?? false
            }
          })
        )
      );

      await Promise.all(
        tasksToCreate.map((t) =>
          this.createProspectiveSponsorTask(
            submitter,
            organization,
            prospectiveSponsorId,
            t.dueDate,
            t.notes,
            t.notifyDate,
            t.assigneeUserId
          )
        )
      );
    }

    // Handle contact upsert based on status
    const { contactId: oldContactId } = oldProspectiveSponsor;
    let contactId = oldContactId;
    if (!isNotInContact && contactName) {
      if (oldProspectiveSponsor.contactId) {
        // Update existing contact
        await prisma.sponsor_Contact.update({
          where: { sponsorContactId: oldProspectiveSponsor.contactId },
          data: { name: contactName, email: contactEmail, phone: contactPhone, position: contactPosition }
        });
      } else {
        // Create new contact (transitioning from NOT_IN_CONTACT)
        const contact = await prisma.sponsor_Contact.create({
          data: { name: contactName, email: contactEmail, phone: contactPhone, position: contactPosition }
        });
        contactId = contact.sponsorContactId;
      }
    } else if (isNotInContact && oldProspectiveSponsor.contactId) {
      // Clear contact when moving to NOT_IN_CONTACT
      contactId = null;
    }

    const updatedProspectiveSponsor = await prisma.prospective_Sponsor.update({
      where: { prospectiveSponsorId },
      data: {
        organizationName,
        lastContactDate: isNotInContact ? null : lastContactDate,
        highlightThresholdDays: highlightThresholdDays ?? 10,
        status,
        firstContactMethod: isNotInContact ? null : firstContactMethod,
        contactorUserId: isNotInContact ? null : contactorUserId,
        contactId,
        notes
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
  static async getProspectiveSponsorTasks(prospectiveSponsorId: string, organizationId: string): Promise<SponsorTask[]> {
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
    sponsorTierId: string | undefined,
    valueTypes: Sponsor_Value_Type[],
    joinDate: Date,
    activeYears: number[],
    taxExempt: boolean,
    sponsorValue?: number,
    discountCode?: string,
    sponsorNotes?: string,
    stockDescription?: string,
    discountDescription?: string
  ): Promise<ProspectiveSponsor> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads can accept prospective sponsors');
    }

    const prospectiveSponsor = await prisma.prospective_Sponsor.findUnique({
      where: { prospectiveSponsorId, organizationId: organization.organizationId },
      include: { contact: true }
    });

    if (!prospectiveSponsor) throw new NotFoundException('ProspectiveSponsor', prospectiveSponsorId);
    if (prospectiveSponsor.dateDeleted) throw new DeletedException('ProspectiveSponsor', prospectiveSponsorId);
    if (prospectiveSponsor.status === Prospective_Sponsor_Status.ACCEPTED) {
      throw new HttpException(400, 'This prospective sponsor has already been accepted');
    }

    if (sponsorTierId) {
      const tier = await prisma.sponsor_Tier.findUnique({
        where: { sponsorTierId, organizationId: organization.organizationId }
      });

      if (!tier) throw new NotFoundException('SponsorTier', sponsorTierId);
    }

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

    // Create a new contact for the sponsor, copied from the prospective sponsor's contact
    const sponsorContact = await prisma.sponsor_Contact.create({
      data: {
        name: prospectiveSponsor.contact?.name ?? '',
        email: prospectiveSponsor.contact?.email,
        phone: prospectiveSponsor.contact?.phone,
        position: prospectiveSponsor.contact?.position
      }
    });

    // Create the sponsor
    await prisma.sponsor.create({
      data: {
        name: prospectiveSponsor.organizationName,
        activeStatus: true,
        valueTypes,
        sponsorValue,
        stockDescription,
        discountDescription,
        joinDate,
        activeYears,
        sponsorTierId,
        taxExempt,
        discountCode,
        sponsorNotes,
        contactId: sponsorContact.sponsorContactId,
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
