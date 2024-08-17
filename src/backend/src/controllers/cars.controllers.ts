import { NextFunction, Request, Response } from 'express';
import CarsService from '../services/car.services';
import { getCurrentUser } from '../utils/auth.utils';

export default class CarsController {
  static async getAllCars(req: Request, res: Response, next: NextFunction) {
    try {
      const cars = await CarsService.getAllCars(req.organization);

      return res.status(200).json(cars);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createCar(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const car = await CarsService.createCar(req.organization, req.currentUser, name);

      return res.status(201).json(car);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
