import { User } from '@prisma/client';
import { isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

export default class RecruitmentServices {
  /**
   * Creates a new milestone in the given organization Id
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
    organizationId: string
  ) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });

    if (!organization) {
      throw new HttpException(401, `Organization with id ${organizationId} doesn't exist`);
    }

    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create a milestone');

    const milestone = await prisma.milestone.create({
      data: {
        name,
        description,
        dateOfEvent,
        organizationId,
        userCreatedId: submitter.userId
      }
    });

    return milestone;
  }

  /**
   * Gets all Milestons for the given organization Id
   * @param organizationId organization Id of the milestone
   * @returns all the milestones from the given organization
   */
  static async getAllMilestones(organizationId: string) {
    const allMilestones = await prisma.milestone.findMany({
      where: { organizationId }
    });

    if (!organizationId) {
      throw new HttpException(400, `Organization with id ${organizationId} doesn't exist`);
    }

    return allMilestones;
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
  static async editFAQ(
    question: string,
    answer: string,
    submitter: User,
    organizationId: string,
    frequentlyAskedQuestionId: string
  ) {
    if (!organizationId) {
      throw new HttpException(400, `Organization with id ${organizationId} doesn't exist`);
    }

    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('edit frequently asked questions');

    const oldFAQ = await prisma.frequentlyAskedQuestion.findUnique({
      where: { frequentlyAskedQuestionId }
    });

    if (!oldFAQ) {
      throw new NotFoundException('Faq', frequentlyAskedQuestionId);
    }

    const updatedFAQ = await prisma.frequentlyAskedQuestion.update({
      where: { frequentlyAskedQuestionId },
      data: { question, answer }
    });

    return updatedFAQ;
      
   * Creates a new FAQ in the given organization Id
   * @param submitter a user who is making this request
   * @param question question to be displayed by the FAQ
   * @param answer answer to the question of the FAQ
   * @param organizationId the organization Id of the FAQ
   * @returns A newly created FAQ
   */
  static async createFaq(submitter: User, question: string, answer: string, organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create an faq');

    const faq = await prisma.frequentlyAskedQuestion.create({
      data: {
        question,
        answer,
        organizationId,
        userCreatedId: submitter.userId
      }
    });

    return faq;
  }
}
