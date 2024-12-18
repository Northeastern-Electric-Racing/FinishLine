/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import express from 'express';
import StatisticsController from '../controllers/statistics.controllers';
import {
  isGraphDisplayType,
  isGraphType,
  isMeasure,
  isOptionalDate,
  isSpecialPermission,
  nonEmptyString,
  validateInputs
} from '../utils/validation.utils';
import { body } from 'express-validator';

const statisticsRouter = express.Router();

statisticsRouter.post(
  '/graph/create',
  isOptionalDate(body('startDate')),
  isOptionalDate(body('endDate')),
  nonEmptyString(body('title')),
  isGraphType(body('graphType')),
  isGraphDisplayType(body('graphDisplayType')),
  isMeasure(body('measure')),
  body('carId').optional().isString(),
  body('graphCollectionId').optional().isString(),
  body('specialPermissions').isArray(),
  isSpecialPermission(body('specialPermissions.*')),
  validateInputs,
  StatisticsController.createGraph
);

statisticsRouter.get('/graph/:graphId', StatisticsController.getSingleGraph);

export default statisticsRouter;
