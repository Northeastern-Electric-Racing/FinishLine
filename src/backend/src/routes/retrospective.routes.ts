import { Router } from 'express';
import RetrospectiveController from '../controllers/retrospectives.controllers';

const retrospectiveRouter = Router();

retrospectiveRouter.get('/timelines', RetrospectiveController.getRetrospectiveTimelines);
retrospectiveRouter.get('/budgets', RetrospectiveController.getRetrospectiveBudgets);

export default retrospectiveRouter;
