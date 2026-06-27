import express from 'express';
import CarsController from '../controllers/cars.controllers.js';
import { nonEmptyString } from '../utils/validation.utils.js';
import { body } from 'express-validator';

const carsRouter = express.Router();

carsRouter.get('/', CarsController.getAllCars);

carsRouter.post('/create', CarsController.createCar);
carsRouter.post('/:carId/edit', nonEmptyString(body('name')), CarsController.editCar);

export default carsRouter;
