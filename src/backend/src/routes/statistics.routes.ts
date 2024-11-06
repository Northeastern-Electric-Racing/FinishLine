/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import express from 'express';
import StatisticsController from '../controllers/statistics.controllers';

const statisticsRouter = express.Router();

statisticsRouter.post('/createGraph', StatisticsController.createGraph);

export default statisticsRouter;
