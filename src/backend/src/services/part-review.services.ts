import { User } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import { AccessDeniedAdminOnlyException, DeletedException, HttpException, NotFoundException } from '../utils/errors.utils';
import { isAdmin, PartTag } from 'shared';
import prisma from '../prisma/prisma';

export default class PartReviewService {
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
}
