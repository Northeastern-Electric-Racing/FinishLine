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

statisticsRouter.get('/graph/:graphId', StatisticsController.getSingleGraph);

statisticsRouter.post(
  '/graph/create',
  isOptionalDate(body('startDate')),
  isOptionalDate(body('endDate')),
  body('title').isString(),
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

statisticsRouter.post(
  '/graph/:graphId/edit',
  isOptionalDate(body('startDate')),
  isOptionalDate(body('endDate')),
  body('title').isString(),
  isGraphType(body('graphType')),
  isGraphDisplayType(body('graphDisplayType')),
  isMeasure(body('measure')),
  body('carId').optional().isString(),
  body('graphCollectionId').optional().isString(),
  body('specialPermissions').isArray(),
  isSpecialPermission(body('specialPermissions.*')),
  validateInputs,
  StatisticsController.editGraph
);

statisticsRouter.get('/graph-collections', StatisticsController.getAllGraphCollections);

statisticsRouter.post(
  '/graph-collections/create',
  nonEmptyString(body('title')),
  body('specialPermissions').isArray(),
  isSpecialPermission(body('specialPermissions.*')),
  validateInputs,
  StatisticsController.createGraphCollection
);

statisticsRouter.get('/graph-collections/:graphCollectionId', StatisticsController.getSingleGraphCollection);

statisticsRouter.post(
  '/graph-collections/:graphCollectionId/edit',
  nonEmptyString(body('title')),
  body('specialPermissions').isArray(),
  isSpecialPermission(body('specialPermissions.*')),
  validateInputs,
  StatisticsController.editGraphCollection
);

statisticsRouter.post(
  '/graph-collections/:graphCollectionId/remove/:graphId',
  StatisticsController.removeGraphFromGraphCollection
);

statisticsRouter.delete('/graph-collections/:graphCollectionId/delete', StatisticsController.deleteGraphCollection);

export default statisticsRouter;
