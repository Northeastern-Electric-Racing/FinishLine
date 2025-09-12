import { NextFunction, Request, Response } from 'express';
import MachineryService from '../services/machinery.services';

export default class MachineryController {
  static async createMachinery(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, shopId, quantity } = req.body;

      const machinery = await MachineryService.createMachinery(req.currentUser, name, shopId, quantity, req.organization);
      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }
}
