import { Organization, User } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import { FrequentlyAskedQuestion, isAdmin, PartReviewCommonMistake, PartTag, Project, WbsNumber } from 'shared';
import { AccessDeniedAdminOnlyException, DeletedException, HttpException, NotFoundException } from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import { getFaqQueryArgs } from '../prisma-query-args/faq.query-args';
import { getPartQueryArgs, partReviewQueryArgs } from '../prisma-query-args/part-review.query-args';
import { faqTransformer } from '../transformers/faq.transformer';
import { partPreviewTransformer } from '../transformers/part-review.transformer';
import { partsReviewCommonMistakeTransformer } from '../transformers/part-review.transformer';
import ProjectsService from '../services/projects.services';

export default class PartReviewService {
  /**
   * Gets all parts for the given project
   * @param wbsNumber the wbs number of the project
   * @param organization the organization to get the parts for
   * @returns all the parts from the given project
   */
  static async getAllPartsForProject(wbsNumber: WbsNumber, organization: Organization) {
    const project: Project = await ProjectsService.getSingleProject(wbsNumber, organization);

    const parts = await prisma.part.findMany({
      where: {
        projectId: project.id,
        dateDeleted: null
      },
      ...getPartQueryArgs(organization.organizationId)
    });

    return parts.map(partPreviewTransformer);
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
   * creates a new part tag with no ascociated parts
   * @param name the name of the tag
   * @param colorHexCode the color of the tag
   * @param creator the user creating the tag -- must be admin
   * @param organizationId the organization id
   * @returns the created part tag
   */
  static async createPartTag(name: string, colorHexCode: string, creator: User, organizationId: string): Promise<PartTag> {
    if (!(await userHasPermission(creator.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create part review tag');
    }

    const partTag = await prisma.partTag.create({
      data: {
        name,
        colorHexCode,
        organization: {
          connect: {
            organizationId
          }
        }
      }
    });

    return partTag;
  }

  /**
   * updates an existing part tag
   * @param partTagId the id of the part tag to update
   * @param name the name of the tag
   * @param colorHexCode the color of the tag
   * @param updater the user updating the tag -- must be admin
   * @param organizationId the organization id
   * @returns the updated part tag
   */
  static async updatePartTag(
    partTagId: string,
    name: string,
    colorHexCode: string,
    updater: User,
    organizationId: string
  ): Promise<PartTag> {
    if (!(await userHasPermission(updater.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('update part review tag');
    }

    const partTag = await prisma.partTag.findUnique({
      where: {
        partTagId
      }
    });

    if (!partTag) {
      throw new NotFoundException('Part Tag', partTagId);
    }

    if (partTag.dateDeleted) {
      throw new DeletedException('Part Tag', partTagId);
    }

    const updatedPartTag = await prisma.partTag.update({
      where: {
        partTagId
      },
      data: {
        name,
        colorHexCode
      }
    });

    return updatedPartTag;
  }

  /**
   * deletes an existing part tag
   * @param partTagId the id of the part tag to delete
   * @param deleter the user deleting the tag -- must be admin
   * @param organizationId the organization id
   * @returns the delted part tag
   * @throws if there are existing parts with this tag
   */
  static async deletePartTag(partTagId: string, deleter: User, organizationId: string): Promise<PartTag> {
    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete part review tag');
    }

    const partTagWithParts = await prisma.partTag.findUnique({
      where: { partTagId },
      include: {
        parts: true
      }
    });

    if (!partTagWithParts) {
      throw new NotFoundException('Part Tag', partTagId);
    }

    if (
      !partTagWithParts.parts.every((part) => {
        return !part.dateDeleted;
      })
    ) {
      throw new HttpException(409, `Cannot delete part tag ${partTagId} because it has associated parts`);
    }

    const deletedPartTag = await prisma.partTag.update({
      where: {
        partTagId
      },
      data: {
        dateDeleted: new Date()
      }
    });

    return deletedPartTag;
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
   * Gets all of the common mistakes associated with part reviews in the given organization
   * @param organizationId the organization
   * @returns an array of common mistakes
   */
  static async getAllCommonMistakes(organizationId: string): Promise<PartReviewCommonMistake[]> {
    const commonMistakes = await prisma.partReviewCommonMistake.findMany({
      where: {
        dateDeleted: null,
        organizationId
      },
      ...getFaqQueryArgs(organizationId)
    });

    return commonMistakes.map(partsReviewCommonMistakeTransformer);
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
   * Creates a part review popup
   * @param organizationId Id of the organization
   * @param reviewId ID of the review
   * @param xCoord X coordinate of the popup
   * @param yCoord Y coordinate of the popup
   * @param title Title of the popup
   * @param description Description of the popup
   * @param creator The user creating the popup
   * @returns The newly created popup
   */
  static async createPartReviewPopup(
    organizationId: string,
    reviewId: string,
    xCoord: number,
    yCoord: number,
    title: string,
    description: string,
    creator: User
  ) {
    const review = await prisma.partReview.findUnique({
      where: {
        partReviewId: reviewId
      }
    });

    if (!review || review.deletedAt !== null) {
      throw new NotFoundException('Part Review', reviewId);
    }

    const isAdminUser = await userHasPermission(creator.userId, organizationId, isAdmin);

    if (review.userCreatedId !== creator.userId && !isAdminUser) {
      throw new AccessDeniedAdminOnlyException('create part review popup');
    }

    const newPopup = await prisma.part_Review_Popup.create({
      data: {
        review: {
          connect: {
            partReviewId: reviewId
          }
        },
        xCoord,
        yCoord,
        title,
        description
      },
      ...partReviewQueryArgs
    });
    return newPopup;
  }

  /**
   * Updates a part review popup
   * @param organizationId id of the organization
   * @param popupId ID of the popup to update
   * @param xCoord New X coordinate
   * @param yCoord New Y coordinate
   * @param title New title
   * @param description New description
   * @param updater The user updating the popup
   * @returns The updated popup
   */
  static async updatePartReviewPopup(
    organizationId: string,
    popupId: string,
    xCoord: number,
    yCoord: number,
    title: string,
    description: string,
    updater: User
  ) {
    const popup = await prisma.part_Review_Popup.findUnique({
      where: {
        partReviewPopupId: popupId
      }
    });

    if (!popup || popup.deletedAt !== null) {
      throw new NotFoundException('Pop Up', popupId);
    }

    const isAdminUser = await userHasPermission(updater.userId, organizationId, isAdmin);

    if (!isAdminUser) {
      throw new AccessDeniedAdminOnlyException('update part review popup');
    }

    return prisma.part_Review_Popup.update({
      where: {
        partReviewPopupId: popupId
      },
      data: {
        xCoord,
        yCoord,
        title,
        description,
        updatedAt: new Date()
      },
      ...partReviewQueryArgs
    });
  }

  /**
   * Deletes a part review popup
   * @param popupId ID of the popup to delete
   * @param deleter The user deleting the popup
   * @returns Confirmation message
   */
  static async deletePartReviewPopup(popupId: string, deleter: User, organizationId: string) {
    const popup = await prisma.part_Review_Popup.findUnique({
      where: { partReviewPopupId: popupId },
      include: { review: { select: { userCreatedId: true, partReviewId: true } } }
    });

    if (!popup || popup.deletedAt) {
      throw new NotFoundException('Pop Up', popupId);
    }

    const isAdminUser = await userHasPermission(deleter.userId, organizationId, isAdmin);

    if (!isAdminUser) {
      throw new AccessDeniedAdminOnlyException('delete part review popup');
    }

    const deletedPopup = await prisma.part_Review_Popup.update({
      where: { partReviewPopupId: popupId },
      data: {
        deletedAt: new Date()
      },
      ...partReviewQueryArgs
    });

    return deletedPopup;
  }
}
