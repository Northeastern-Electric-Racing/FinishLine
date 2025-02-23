import { User } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import { FrequentlyAskedQuestion, isAdmin } from 'shared';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import { getFaqQueryArgs } from '../prisma-query-args/faq.query-args';
import { faqTransformer } from '../transformers/faq.transformer';

export default class PartReviewService {
  /**
   * Creates an faq
   * @param question the question
   * @param answer the answer
   * @param creator user creating -- must be admin
   * @param organizationId the organization
   * @returns the faq
   */
  static async createFaq(
    question: string,
    answer: string,
    creator: User,
    organizationId: string
  ): Promise<FrequentlyAskedQuestion> {
    if (!(await userHasPermission(creator.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create part review faq');
    }

    const faq = await prisma.frequentlyAskedQuestion.create({
      data: {
        question,
        answer,
        userCreated: {
          connect: {
            userId: creator.userId
          }
        },
        partReviewFaqOrg: {
          connect: {
            organizationId
          }
        }
      },
      ...getFaqQueryArgs(organizationId)
    });

    return faqTransformer(faq);
  }

  /**
   * updates an faq
   * @param faqId the faq to update
   * @param question the question
   * @param answer the answer
   * @param updater the user updating -- must be an admin
   * @param organizationId the organization
   * @returns the updated faq
   */
  static async updateFaq(
    faqId: string,
    question: string,
    answer: string,
    updater: User,
    organizationId: string
  ): Promise<FrequentlyAskedQuestion> {
    const faq = await prisma.frequentlyAskedQuestion.findUnique({
      where: {
        faqId
      }
    });

    if (!faq) {
      throw new NotFoundException('Faq', faqId);
    }

    if (faq.dateDeleted) {
      throw new DeletedException('Faq', faqId);
    }

    if (!(await userHasPermission(updater.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update faq');
    }

    const updatedFaq = await prisma.frequentlyAskedQuestion.update({
      where: {
        faqId
      },
      data: {
        question,
        answer
      },
      ...getFaqQueryArgs(organizationId)
    });

    return faqTransformer(updatedFaq);
  }

  /**
   * Deletes an faq
   * @param faqId the faq to delete
   * @param deleter the user deleting -- must be admin
   * @param organizationId the organization
   * @returns the deleted faq
   */
  static async deleteFaq(faqId: string, deleter: User, organizationId: string): Promise<FrequentlyAskedQuestion> {
    const faq = await prisma.frequentlyAskedQuestion.findUnique({
      where: {
        faqId
      },
      ...getFaqQueryArgs
    });

    if (!faq) {
      throw new NotFoundException('Faq', faqId);
    }

    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete faq');
    }

    const deletedFaq = await prisma.frequentlyAskedQuestion.update({
      where: {
        faqId
      },
      data: {
        userDeleted: {
          connect: {
            userId: deleter.userId
          }
        },
        dateDeleted: new Date()
      },
      ...getFaqQueryArgs(organizationId)
    });

    return faqTransformer(deletedFaq);
  }
}
