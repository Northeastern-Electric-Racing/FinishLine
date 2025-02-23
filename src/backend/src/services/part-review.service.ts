import { User } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import { FrequentlyAskedQuestion, isAdmin } from 'shared';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import { partReviewFaqTransformer } from '../transformers/part-review.transformer';

export default class PartReviewService {
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
      }
    });

    return partReviewFaqTransformer(faq);
  }

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
      }
    });

    return partReviewFaqTransformer(updatedFaq);
  }

  static async deleteFaq(
    faqId: string,
    deleter: User,
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
      }
    });

    return partReviewFaqTransformer(deletedFaq);
  }
}
