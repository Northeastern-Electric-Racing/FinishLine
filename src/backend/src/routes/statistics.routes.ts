/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import express from 'express';
import StatisticsController from '../controllers/statistics.controllers';
import { isDate, isGraphType, isMeasure, nonEmptyString, validateGraphGen, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';

const statisticsRouter = express.Router();

statisticsRouter.post(
  '/graph/create',
  isDate(body('startDate')),
  isDate(body('endDate')),
  nonEmptyString(body('title')),
  isGraphType(body('graphType')),
  isMeasure(body('measure')),
  body('graphCollectionId').optional().isString(),
  validateGraphGen(),
  validateInputs,
  StatisticsController.createGraph
);

statisticsRouter.post(
  '/graph/:graphId/edit',
  // todo - verify user is a user
  
  isDate(body('startDate')),
  isDate(body('endDate')),
  nonEmptyString(body('title')),
  isGraphType(body('graphType')),
  isMeasure(body('measure')),
  body('graphCollectionId').optional().isString(),
  validateGraphGen(),
  validateInputs,
  StatisticsController.editGraph
);

export default statisticsRouter;
