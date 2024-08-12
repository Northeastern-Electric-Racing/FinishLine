import { NextFunction, Request, Response } from 'express';
import CarsService from '../services/car.services';
import { getCurrentUser } from '../utils/auth.utils';
import { getOrganization } from '../utils/utils';

export default class CarsController {
  static async getAllCars(req: Request, res: Response, next: NextFunction) {
    try {
      const organization = await getOrganization(req.headers);
      await getCurrentUser(res);
      const cars = await CarsService.getAllCars(organization);

      res.status(200).json(cars);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createCar(req: Request, res: Response, next: NextFunction) {
    try {
      const organization = await getOrganization(req.headers);
      const user = await getCurrentUser(res);
      const { name } = req.body;
      const car = await CarsService.createCar(organization, user, name);

      res.status(201).json(car);
    } catch (error: unknown) {
      next(error);
    }
  }
}
