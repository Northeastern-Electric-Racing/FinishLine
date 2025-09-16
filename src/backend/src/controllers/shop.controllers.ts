import { NextFunction, Request, Response } from 'express';
import ShopService from '../services/shop.services';

export default class ShopController {
  static async createShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const shop = await ShopService.createShop((req as any).currentUser, name, description, (req as any).organization);
      res.status(201).json(shop);
    } catch (error) {
      next(error);
    }
  }
}
