import { WBS_Element_Status } from '@prisma/client';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../prisma/prisma';
import { hasBulletCheckingPermissions } from '../utils/description-bullets.utils';

export const checkDescriptionBullet = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const { userId, descriptionId } = body;

  const originalDB = await prisma.description_Bullet.findUnique({
    where: { descriptionId },
    include: {
      workPackageDeliverables: { include: { wbsElement: true } },
      workPackageExpectedActivities: { include: { wbsElement: true } }
    }
  });

  if (!originalDB) {
    return res.status(404).json({ message: `Description Bullet with id ${descriptionId} not found` });
  }

  if (originalDB.dateDeleted) {
    return res.status(400).json({ message: 'Cant edit a deleted Description Bullet' });
  }

  const workPackage = originalDB.workPackageDeliverables || originalDB.workPackageExpectedActivities;
  if (!workPackage) {
    return res.status(400).json({
      message: 'This description bullet is not tied to a workpackage deliverable or expected activity!'
    });
  }

  if (workPackage.wbsElement.status !== WBS_Element_Status.ACTIVE) {
    return res.status(400).json({ message: 'Cannot check a description bullet on an inactive work package!' });
  }

  const hasPerms = await hasBulletCheckingPermissions(userId, descriptionId);

  if (!hasPerms) {
    return res.status(403).json({ message: 'Access Denied' });
  }

  let updatedDB;

  if (originalDB.userCheckedId) {
    updatedDB = await prisma.description_Bullet.update({
      where: { descriptionId },
      data: {
        userCheckedId: null,
        dateTimeChecked: null
      }
    });
  } else {
    updatedDB = await prisma.description_Bullet.update({
      where: { descriptionId },
      data: {
        userCheckedId: userId,
        dateTimeChecked: new Date()
      }
    });
  }

  return res.status(200).json(updatedDB);
};
