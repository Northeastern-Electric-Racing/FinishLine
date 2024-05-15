import { User, WBS_Element_Status } from '@prisma/client';
import prisma from '../prisma/prisma';
import { hasBulletCheckingPermissions } from '../utils/description-bullets.utils';
import { AccessDeniedException, HttpException, NotFoundException, DeletedException } from '../utils/errors.utils';
import descriptionBulletTransformer from '../transformers/description-bullets.transformer';
import { DescriptionBullet } from 'shared';
import { getDescriptionBulletQueryArgs } from '../prisma-query-args/description-bullets.query-args';

export default class DescriptionBulletsService {
  /**
   * Checks the description bullet
   * @param user user that checks the description bullet
   * @param descriptionId description of bullet that is being checked
   * @param organizationId organization id of the user
   * @throws if bullet doesn't exist or if the bullet is not linked to anything valid
   * @returns a checked description bullet
   */
  static async checkDescriptionBullet(
    user: User,
    descriptionId: number,
    organizationId: string
  ): Promise<DescriptionBullet> {
    const originalDB = await prisma.description_Bullet.findUnique({
      where: { descriptionId },
      include: {
        wbsElement: {
          include: {
            workPackage: true
          }
        }
      }
    });
    if (!originalDB) throw new NotFoundException('Description Bullet', descriptionId);
    if (originalDB.dateDeleted) throw new DeletedException('Description Bullet', descriptionId);

    const { wbsElement } = originalDB;
    if (!wbsElement?.workPackage) throw new HttpException(400, 'This description bullet is not tied to a workpackage');

    if (wbsElement.status !== WBS_Element_Status.ACTIVE)
      throw new HttpException(400, 'Cannot check a description bullet on an inactive work package!');

    const hasPerms = await hasBulletCheckingPermissions(user.userId, descriptionId, organizationId);

    if (!hasPerms) throw new AccessDeniedException('You do not have permission to check this description bullet!');

    let updatedDB;

    if (originalDB.userCheckedId) {
      updatedDB = await prisma.description_Bullet.update({
        where: { descriptionId },
        data: {
          userCheckedId: null,
          dateTimeChecked: null
        },
        ...getDescriptionBulletQueryArgs(organizationId)
      });
    } else {
      updatedDB = await prisma.description_Bullet.update({
        where: { descriptionId },
        data: {
          userCheckedId: user.userId,
          dateTimeChecked: new Date()
        },
        ...getDescriptionBulletQueryArgs(organizationId)
      });
    }

    return descriptionBulletTransformer(updatedDB);
  }
}
