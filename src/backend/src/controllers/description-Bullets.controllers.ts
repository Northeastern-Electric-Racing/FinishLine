import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const checkWorkPackageDescriptionBullet = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const { submitterId, descriptionBulletId } = body;

  return res.status(200).json(body);
};
