import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/prisma.js';
import { NotFoundException } from './errors.utils.js';

export const getCurrentCar = async (req: Request, _res: Response, next: NextFunction) => {
  const carId = req.headers.carid;

  if (!carId || typeof carId !== 'string') {
    return next();
  }

  try {
    const car = await prisma.car.findUnique({
      where: { carId }
    });

    if (!car) {
      throw new NotFoundException('Car', carId);
    }

    req.currentCar = car;
    return next();
  } catch (error) {
    return next(error);
  }
};
