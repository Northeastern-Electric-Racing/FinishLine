import { User } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import { FrequentlyAskedQuestion, isAdmin, PartReviewCommonMistake } from 'shared';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import { getFaqQueryArgs } from '../prisma-query-args/faq.query-args';
import { faqTransformer } from '../transformers/faq.transformer';
import { partsReviewCommonMistakeTransformer, partTransformer } from '../transformers/part-review.transformer';

export default class PartReviewService {
  /**
   * Uses the given partId to get the specific part and all of its constituent data
   * @param partId the id of the part
   * @returns a single Part
   */
  static async getPart(partId: string) {
    const part = await prisma.part.findUnique({
      where: { partId: partId, dateDeleted: null },
      include: {
        tags: true,
        submissions: true,
        assignees: true,
        userCreated: true
      }
    });
    return partTransformer(part);
  }

  /**
   * Uses the given project ID to fetch the respective part preview
   * @param projectId the id of the project
   * @returns a part preview
   */
  static async getPartPreviews(projectId: string) {
    const part = await prisma.part.findUnique({
      where: { projectId: projectId, dateDeleted: null },
      include: {
        tags: true,
        submissions: true,
        assignees: true,
        userCreated: true
      }
    })

    part.
  }

  /**
   * Uses the given organizationID to and returns an array of part tags
   * @param organizationId the organization to get the parts for
   * @returns an array of part tags
   */
  static async getAllPartTags(organizationId: string) {
    return prisma.partTag.findMany({
      where: {
        organizationId,
        dateDeleted: null
      }
    });
  }

  /**
   * Gets all part review FAQs for the given organization Id
   * @param organizationId organization Id of the FAQ
   * @returns all the part review faqs from the given organization
   */
  static async getAllPartReviewFAQs(organizationId: string) {
    const partReviewFAQs = await prisma.frequentlyAskedQuestion.findMany({
      where: { dateDeleted: null, partReviewFaqOrgId: organizationId },
      ...getFaqQueryArgs(organizationId)
    });

    return partReviewFAQs.map(faqTransformer);
  }

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

  /**
   * Creates a common mistake
   * @param title the title
   * @param description the description
   * @param starred whether or not it is starred
   * @param creator the use creating -- must be an admin
   * @param organizationId the organization
   * @returns the created common mistake
   */
  static async createCommonMistake(
    title: string,
    description: string,
    starred: boolean,
    creator: User,
    organizationId: string
  ): Promise<PartReviewCommonMistake> {
    if (!(await userHasPermission(creator.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create common mistake');
    }

    const commonMistake = await prisma.partReviewCommonMistake.create({
      data: {
        title,
        description,
        starred,
        userCreated: {
          connect: {
            userId: creator.userId
          }
        },
        organization: {
          connect: {
            organizationId
          }
        }
      }
    });

    return partsReviewCommonMistakeTransformer(commonMistake);
  }

  /**
   * Updates a common mistake
   * @param commonMistakeId the id of the common mistake to be updated
   * @param title the title
   * @param description the description
   * @param starred whether or not it is starred
   * @param updater the user makign the update -- must be admin
   * @param organizationId the organization
   * @returns the updated common mistake
   */
  static async updateCommonMistake(
    commonMistakeId: string,
    title: string,
    description: string,
    starred: boolean,
    updater: User,
    organizationId: string
  ): Promise<PartReviewCommonMistake> {
    const commonMistake = await prisma.partReviewCommonMistake.findUnique({
      where: {
        partReviewCommonMistakeId: commonMistakeId
      }
    });

    if (!commonMistake) {
      throw new NotFoundException('common mistake', commonMistakeId);
    }

    if (commonMistake.dateDeleted) {
      throw new DeletedException('common mistake', commonMistakeId);
    }

    if (!(await userHasPermission(updater.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update common mistake');
    }

    const updatedCommonMistake = await prisma.partReviewCommonMistake.update({
      where: {
        partReviewCommonMistakeId: commonMistakeId
      },
      data: {
        title,
        description,
        starred
      }
    });

    return partsReviewCommonMistakeTransformer(updatedCommonMistake);
  }

  /**
   * Deletes a common mistake
   * @param commonMistakeId the id of the common mistake to delete
   * @param deleter the user deleting -- must be admin
   * @param organizationId the orgainization
   * @returns the deleted common mistake
   */
  static async deleteCommonMistake(
    commonMistakeId: string,
    deleter: User,
    organizationId: string
  ): Promise<PartReviewCommonMistake> {
    const commonMistake = await prisma.partReviewCommonMistake.findUnique({
      where: {
        partReviewCommonMistakeId: commonMistakeId
      }
    });

    if (!commonMistake) {
      throw new NotFoundException('common mistake', commonMistakeId);
    }

    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete common mistake');
    }

    const deletedCommonMistake = await prisma.partReviewCommonMistake.update({
      where: {
        partReviewCommonMistakeId: commonMistakeId
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

    return partsReviewCommonMistakeTransformer(deletedCommonMistake);
  }
}
