import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import MaterialService from '../services/materials.services';
import { User } from '@prisma/client';

export default class MaterialsController {
  static async deleteMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialId } = req.params;

      const user: User = await getCurrentUser(res);

      const updatedMaterial = await MaterialService.deleteMaterial(user, materialId);

      res.status(200).json(updatedMaterial);
    } catch (error: unknown) {
      next(error);
    }
  }
}
