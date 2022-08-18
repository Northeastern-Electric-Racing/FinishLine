import express from 'express';
import {
  editProject,
  getAllProjects,
  getSingleProject,
  newProject
} from '../controllers/projects.controllers';
import { body } from 'express-validator';
import { WbsElementStatus } from 'shared';
import { authenticateToken } from '../utils/utils';

const projectRouter = express.Router();

projectRouter.get('/', authenticateToken, getAllProjects);
projectRouter.get('/:wbsNum', getSingleProject);
projectRouter.post(
  '/new',
  body('userId').isInt({ min: 0 }).not().isString(),
  body('crId').isInt({ min: 0 }).not().isString(),
  body('name').isString().not().isEmpty(),
  body('carNumber').isInt({ min: 0 }).not().isString(),
  body('summary').isString().not().isEmpty(),
  newProject
);
projectRouter.post(
  '/edit',
  body('projectId').isInt({ min: 0 }).not().isString(),
  body('crId').isInt({ min: 0 }).not().isString(),
  body('name').isString().not().isEmpty(),
  body('userId').isInt({ min: 0 }).not().isString(),
  body('budget').isInt({ min: 0 }).not().isString(),
  body('summary').isString().not().isEmpty(),
  body('rules').isArray(),
  body('rules.*').isString().not().isEmpty(),
  body('goals').isArray(),
  body('goals.*.id').optional().isInt({ min: 0 }).not().isString(),
  body('goals.*.detail').isString().not().isEmpty(),
  body('features').isArray(),
  body('features.*.id').optional().isInt({ min: 0 }).not().isString(),
  body('features.*.detail').isString().not().isEmpty(),
  body('otherConstraints').isArray(),
  body('otherConstraints.*.id').optional().isInt({ min: 0 }).not().isString(),
  body('otherConstraints.*.detail').isString().not().isEmpty(),
  body('wbsElementStatus').custom((value) => Object.values(WbsElementStatus).includes(value)),
  body('googleDriveFolderLink').isString().not().isEmpty(),
  body('slideDeckLink').isString().not().isEmpty(),
  body('bomLink').isString().not().isEmpty(),
  body('taskListLink').isString().not().isEmpty(),
  body('projectLead').optional().isInt({ min: 0 }).not().isString(),
  body('projectManager').optional().isInt({ min: 0 }).not().isString(),
  editProject
);

export default projectRouter;
