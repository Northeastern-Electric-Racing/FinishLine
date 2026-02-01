import express from 'express';
import CarsController from '../controllers/cars.controllers.js';

const carsRouter = express.Router();

carsRouter.get('/', CarsController.getAllCars);

carsRouter.post('/create', CarsController.createCar);

export default carsRouter;
