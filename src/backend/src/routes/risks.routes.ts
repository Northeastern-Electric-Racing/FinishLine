import express from 'express';
import { getRisksForProject } from '../controllers/risks.controllers';

const risksRouter = express.Router();

risksRouter.get('/:projectId', getRisksForProject);

export default risksRouter;
