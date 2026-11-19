import CarsController from '../controllers/cars.controllers.js';
import { nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import { body } from 'express-validator';
import { createRouter } from '../utils/api-key.utils.js';

const carsRouter = createRouter();

carsRouter.get('/', CarsController.getAllCars);

carsRouter.post('/create', CarsController.createCar);
carsRouter.post('/:carId/edit', nonEmptyString(body('name')), validateInputs, CarsController.editCar);

export default carsRouter;
