import express from 'express';
import { body, param } from 'express-validator';
import { isDateOnly, nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import DateMarkersController from '../controllers/date-markers.controllers.js';

const dateMarkersRouter = express.Router();

dateMarkersRouter.get('/', DateMarkersController.getAllDateMarkers);

dateMarkersRouter.post(
  '/create',
  nonEmptyString(body('name')),
  isDateOnly(body('date')),
  validateInputs,
  DateMarkersController.createDateMarker
);

dateMarkersRouter.post(
  '/:dateMarkerId/edit',
  nonEmptyString(param('dateMarkerId')),
  nonEmptyString(body('name')),
  isDateOnly(body('date')),
  validateInputs,
  DateMarkersController.editDateMarker
);

dateMarkersRouter.post(
  '/:dateMarkerId/delete',
  nonEmptyString(param('dateMarkerId')),
  validateInputs,
  DateMarkersController.deleteDateMarker
);

export default dateMarkersRouter;
