import { isAdmin, PartReviewCommonMistake } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { User } from '@prisma/client';
import { partsReviewCommonMistakeTransformer } from '../transformers/part-review.transformer';

export default class PartReviewService {
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
        id: commonMistakeId
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
        id: commonMistakeId
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
        id: commonMistakeId
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
        id: commonMistakeId
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
