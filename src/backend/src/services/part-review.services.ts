import { User } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import { FrequentlyAskedQuestion, isAdmin, PartReviewCommonMistake } from 'shared';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import { getFaqQueryArgs } from '../prisma-query-args/faq.query-args';
import { faqTransformer } from '../transformers/faq.transformer';
import { partsReviewCommonMistakeTransformer } from '../transformers/part-review.transformer';

export default class PartReviewService {
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

      /**
     * Finds a review by ID
     * @param reviewId ID of the review
     * @returns The review or null if not found
     */
      static async findReviewById(reviewId: string) {
        return prisma.partReview.findUnique({
            where: { partReviewId: reviewId },
            select: { userCreatedId: true }
        });
    }

    /**
     * Creates a part review popup
     * @param reviewId ID of the review
     * @param xCoord X coordinate of the popup
     * @param yCoord Y coordinate of the popup
     * @param title Title of the popup
     * @param description Description of the popup
     * @param creator The user creating the popup
     * @returns The newly created popup
     */
    static async createPartReviewPopup(
        reviewId: string,
        xCoord: number,
        yCoord: number,
        title: string,
        description: string,
        creator: User
    ) {
        const review = await this.findReviewById(reviewId);
        if (!review) {
            throw new NotFoundException('Review', reviewId);
        }

        const isAdminUser = creator.additionalPermissions?.includes('ADMIN') || false;

        if (review.userCreatedId !== creator.userId && !isAdminUser) {
            throw new AccessDeniedAdminOnlyException('create part review popup');
        }

        return prisma.part_Review_Popup.create({
            data: { reviewId, xCoord, yCoord, title, description }
        });
    }

    /**
     * Updates a part review popup
     * @param popupId ID of the popup to update
     * @param xCoord New X coordinate
     * @param yCoord New Y coordinate
     * @param title New title
     * @param description New description
     * @param updater The user updating the popup
     * @returns The updated popup
     */
    static async updatePartReviewPopup(
        popupId: string,
        xCoord: number,
        yCoord: number,
        title: string,
        description: string,
        updater: User
    ) {
        const popup = await prisma.part_Review_Popup.findUnique({
            where: { partReviewPopupId: popupId },
            include: { review: { select: { userCreatedId: true } } }
        });

        if (!popup) {
            throw new NotFoundException('Pop Up', popupId);
        }

        const isAdminUser = updater.additionalPermissions?.includes('ADMIN') || false;

        if (popup.review.userCreatedId !== updater.userId && !isAdminUser) {
            throw new AccessDeniedAdminOnlyException('update part review popup');
        }

        return prisma.part_Review_Popup.update({
            where: { partReviewPopupId: popupId },
            data: { xCoord, yCoord, title, description }
        });
    }

    /**
     * Deletes a part review popup
     * @param popupId ID of the popup to delete
     * @param deleter The user deleting the popup
     * @returns Confirmation message
     */
    static async deletePartReviewPopup(popupId: string, deleter: User) {
        const popup = await prisma.part_Review_Popup.findUnique({
            where: { partReviewPopupId: popupId },
            include: { review: { select: { userCreatedId: true } } }
        });

        if (!popup) {
            throw new NotFoundException('Pop Up', popupId);
        }

        const isAdminUser = deleter.additionalPermissions?.includes('ADMIN') || false;

        if (popup.review.userCreatedId !== deleter.userId && !isAdminUser) {
            throw new AccessDeniedAdminOnlyException('delete part review popup');
        }

        await prisma.part_Review_Popup.delete({
            where: { partReviewPopupId: popupId }
        });

        return { message: 'Popup deleted successfully' };
    }
}
