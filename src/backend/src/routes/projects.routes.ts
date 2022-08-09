import express from 'express';
import {
  editProject,
  getAllProjects,
  getSingleProject,
  newProject
} from '../controllers/projects.controllers';
import { body } from 'express-validator';
import { WbsElementStatus } from 'shared';

const projectRouter = express.Router();

projectRouter.get('/', getAllProjects);
projectRouter.get('/:wbsNum', getSingleProject);
projectRouter.post(
  '/new',
  body('userId').isInt({ min: 0 }),
  body('crId').isInt({ min: 0 }),
  body('name').not().isEmpty(),
  body('carNumber').isInt({ min: 0 }),
  body('summary').not().isEmpty(),
  newProject
);
projectRouter.post(
  '/edit',
  body('projectId').isInt({ min: 0 }),
  body('crId').isInt({ min: 0 }),
  body('name').not().isEmpty(),
  body('userId').isInt({ min: 0 }),
  body('budget').isInt({ min: 0 }),
  body('summary').not().isEmpty(),
  body('rules').isArray(),
  body('rules.*').not().isEmpty(),
  body('goals').isArray(),
  body('goals.*.id').optional().isInt({ min: 0 }),
  body('goals.*.detail').not().isEmpty(),
  body('features').isArray(),
  body('features.*.id').optional().isInt({ min: 0 }),
  body('features.*.detail').not().isEmpty(),
  body('otherConstraints').isArray(),
  body('otherConstraints.*.id').optional().isInt({ min: 0 }),
  body('otherConstraints.*.detail').not().isEmpty(),
  body('wbsElementStatus').custom((value) => Object.values(WbsElementStatus).includes(value)),
  body('googleDriveFolderLink').not().isEmpty(),
  body('slideDeckLink').not().isEmpty(),
  body('bomLink').not().isEmpty(),
  body('taskListLink').not().isEmpty(),
  body('projectLead').optional().isInt({ min: 0 }),
  body('projectManager').optional().isInt({ min: 0 }),
  editProject
);

export default projectRouter;
