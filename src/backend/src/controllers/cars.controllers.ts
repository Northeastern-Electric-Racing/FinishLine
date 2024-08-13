import { NextFunction, Request, Response } from 'express';
import CarsService from '../services/car.services';
import { getCurrentUser } from '../utils/auth.utils';

export default class CarsController {
  static async getAllCars(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const cars = await CarsService.getAllCars(req.organization);

      return res.status(200).json(cars);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createCar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      if (!req.user) {
        return res.status(400).json({ message: 'User not found' });
      }
      const user = await getCurrentUser(res);
      const { name } = req.body;
      const car = await CarsService.createCar(req.organization, user, name);

      return res.status(201).json(car);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
