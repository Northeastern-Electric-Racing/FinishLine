import { User, Organization } from '@prisma/client';
import { isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

export default class RecruitmentServices {
  /**
   * Gets all Milestons for the given organization Id
   * @param organizationId organization Id of the milestone
   * @returns all the milestones from the given organization
   */
  static async getAllMilestones(organization: Organization) {
    const allMilestones = await prisma.milestone.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null }
    });

    return allMilestones;
  }

  /**
   * Creates a new milestone in the given organization
   * @param submitter a user who is making this request
   * @param name the name of the user
   * @param description description of the milestone
   * @param dateOfEvent date of the event of the milestone
   * @param organizationId the organization Id of the milestone
   * @returns A newly created milestone
   */
  static async createMilestone(
    submitter: User,
    name: string,
    description: string,
    dateOfEvent: Date,
    organization: Organization
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create a milestone');

    const milestone = await prisma.milestone.create({
      data: {
        name,
        description,
        dateOfEvent,
        organizationId: organization.organizationId,
        userCreatedId: submitter.userId
      }
    });

    return milestone;
  }

  /**
   * Edits a new milestone with the given id
   * @param submitter a user who is making this request
   * @param name the name of the user
   * @param description description of the milestone
   * @param dateOfEvent date of the event of the milestone
   * @param organizationId the organization Id of the milestone
   * @returns the edited milestone
   */
  static async editMilestone(
    submitter: User,
    name: string,
    description: string,
    dateOfEvent: Date,
    milestoneId: string,
    organization: Organization
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create a milestone');

    const currentMilestone = await prisma.milestone.findUnique({
      where: {
        milestoneId
      }
    });

    if (!currentMilestone) {
      throw new NotFoundException('Milestone', milestoneId);
    }

    if (currentMilestone.dateDeleted) {
      throw new DeletedException('Milestone', milestoneId);
    }

    const updatedMilestone = await prisma.milestone.update({
      where: {
        milestoneId
      },
      data: {
        name,
        description,
        dateOfEvent,
        organizationId: organization.organizationId
      }
    });

    return updatedMilestone;
  }

  /**
   * Gets all FAQs for the given organization Id
   * @param organizationId organization Id of the faq
   * @returns all the faqs from the given organization
   */
  static async getAllFaqs(organization: Organization) {
    const allFaqs = await prisma.frequentlyAskedQuestion.findMany({
      where: { dateDeleted: null, organizationId: organization.organizationId }
    });

    return allFaqs;
  }

  /*
   * Deletes the milestone for the given milestoneId and organizationId
   * @param deleter the user deleting the milestone
   * @param milestoneId milestone id for the specific milestone
   * @param organizationId organization Id of the milestone
   */
  static async deleteMilestone(deleter: User, milestoneId: string, organization: Organization): Promise<void> {
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete milestone');

    const milestone = await prisma.milestone.findUnique({ where: { milestoneId } });

    if (!milestone) throw new NotFoundException('Milestone', milestoneId);

    if (milestone.dateDeleted) throw new DeletedException('Milestone', milestoneId);

    await prisma.milestone.update({
      where: { milestoneId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });
  }

  /**
   * Creates a new FAQ in the given organization Id
   * @param submitter a user who is making this request
   * @param question question to be displayed by the FAQ
   * @param answer answer to the question of the FAQ
   * @param organizationId the organization Id of the FAQ
   * @returns A newly created FAQ
   */
  static async createFaq(submitter: User, question: string, answer: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create an faq');

    const faq = await prisma.frequentlyAskedQuestion.create({
      data: {
        question,
        answer,
        organizationId: organization.organizationId,
        userCreatedId: submitter.userId
      }
    });

    return faq;
  }

  /**
   * Edits the FAQ
   * @param question the updated question value
   * @param answer the updated answer value
   * @param faqId the requested FAQ to be edited
   * @param submitter the user editing the FAQ
   * @param organizationId the organization the user is currently in
   * @returns the updated FAQ
   */
  static async editFAQ(question: string, answer: string, submitter: User, organization: Organization, faqId: string) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('edit frequently asked questions');

    const oldFAQ = await prisma.frequentlyAskedQuestion.findUnique({
      where: { faqId }
    });

    if (!oldFAQ) {
      throw new NotFoundException('Faq', faqId);
    }

    const updatedFAQ = await prisma.frequentlyAskedQuestion.update({
      where: { faqId },
      data: { question, answer }
    });

    return updatedFAQ;
  }

  /**
   * Deletes an FAQ with the given organization Id and FAQ Id
   * @param deleter a user who is making this request
   * @param organizationId the organization Id of the FAQ
   */
  static async deleteFaq(deleter: User, faqId: string, organization: Organization) {
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete an faq');

    const faq = await prisma.frequentlyAskedQuestion.findUnique({ where: { faqId } });

    if (!faq) throw new NotFoundException('Faq', faqId);

    if (faq.dateDeleted) throw new DeletedException('Faq', faqId);

    await prisma.frequentlyAskedQuestion.update({
      where: { faqId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });

    return faq;
  }
}
