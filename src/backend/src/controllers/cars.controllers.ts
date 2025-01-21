import { NextFunction, Request, Response } from 'express';
import CarsService from '../services/car.services';

export default class CarsController {
  static async getAllCars(req: Request, res: Response, next: NextFunction) {
    try {
      const cars = await CarsService.getAllCars(req.organization);

      res.status(200).json(cars);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createCar(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const car = await CarsService.createCar(req.organization, req.currentUser, name);

      res.status(201).json(car);
    } catch (error: unknown) {
      next(error);
    }
  }
}
