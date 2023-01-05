import { User, WBS_Element_Status } from '@prisma/client';
import prisma from '../prisma/prisma';
import { hasBulletCheckingPermissions } from '../utils/description-bullets.utils';
import { AccessDeniedException, HttpException, NotFoundException } from '../utils/errors.utils';
import descBulletTransformer from '../transformers/description-bullets.transformer';
import descriptionBulletQueryArgs from '../prisma-query-args/description-bullets.query-args';

export default class DescriptionBulletsService {
  /**
   * Checks the description bullet
   * @param userId user that checks the description bullet
   * @param descriptionId description of bullet that is being checked
   * @throws if bullet doesn't exist or if the bullet is not linked to anything valid
   * @returns a checked description bullet
   */
  static async checkDescriptionBullet(user: User, descriptionId: number) {
    const originalDB = await prisma.description_Bullet.findUnique({
      where: { descriptionId },
      include: {
        workPackageDeliverables: { include: { wbsElement: true } },
        workPackageExpectedActivities: { include: { wbsElement: true } }
      }
    });
    if (!originalDB) throw new NotFoundException('Description Bullet', descriptionId);

    if (originalDB.dateDeleted) throw new HttpException(400, 'Cant edit a deleted Description Bullet!');

    const workPackage = originalDB.workPackageDeliverables || originalDB.workPackageExpectedActivities;

    if (!workPackage)
      throw new HttpException(400, 'This description bullet is not tied to a workpackage deliverable or expected activity');

    if (workPackage.wbsElement.status !== WBS_Element_Status.ACTIVE)
      throw new HttpException(400, 'Cannot check a description bullet on an inactive work package!');

    const hasPerms = await hasBulletCheckingPermissions(user.userId, descriptionId);

    if (!hasPerms) throw new AccessDeniedException();

    let updatedDB;

    if (originalDB.userCheckedId) {
      updatedDB = await prisma.description_Bullet.update({
        where: { descriptionId },
        data: {
          userCheckedId: null,
          dateTimeChecked: null
        },
        ...descriptionBulletQueryArgs
      });
    } else {
      updatedDB = await prisma.description_Bullet.update({
        where: { descriptionId },
        data: {
          userCheckedId: user.userId,
          dateTimeChecked: new Date()
        },
        ...descriptionBulletQueryArgs
      });
    }

    return descBulletTransformer(updatedDB);
  }
}
