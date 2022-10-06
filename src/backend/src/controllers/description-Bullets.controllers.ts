import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../prisma/prisma';

export const checkWorkPackageDescriptionBullet = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const { submitterId, descriptionBulletId } = body;

  const descriptionId = descriptionBulletId;

  const originalDB = await prisma.description_Bullet.findUnique({ where: { descriptionId } });

  if (!originalDB)
    return res
      .status(404)
      .json({ message: `Description Bullet with id ${descriptionBulletId} not found` });

  if (originalDB.dateDeleted) {
    return res.status(400).json({ message: 'Cant edit a deleted Description Bullet' });
  }

  const updatedDB = await prisma.description_Bullet.update({
    where: { descriptionId },
    data: {
      descriptionId: originalDB.descriptionId,
      userCheckedId: submitterId
    }
  });

  return res.status(200).json(updatedDB);
};
