import express from 'express';
import {
  editProject,
  getAllProjects,
  getSingleProject,
  newProject
} from '../controllers/projects.controllers';
import { body } from 'express-validator';
import { WbsElementStatus } from 'shared';
import intMinZero from 'validation.utils';

const projectRouter = express.Router();

projectRouter.get('/', getAllProjects);
projectRouter.get('/:wbsNum', getSingleProject);
projectRouter.post(
  '/new',
  intMinZero(body('userId')),
  intMinZero(body('crId')),
  intMinZero(body('name')),
  intMinZero(body('carNumber')),
  intMinZero(body('summary')),
  newProject
);
projectRouter.post(
  '/edit',
  intMinZero(body('projectId')),
  intMinZero(body('crId')),
  body('name').isString().not().isEmpty(),
  intMinZero(body('userId')),
  intMinZero(body('budget')),
  body('summary').isString().not().isEmpty(),
  body('rules').isArray(),
  body('rules.*').isString().not().isEmpty(),
  body('goals').isArray(),
  intMinZero(body('goals.*.id')),
  body('goals.*.detail').isString().not().isEmpty(),
  body('features').isArray(),
  intMinZero(body('features.*.id')),
  body('features.*.detail').isString().not().isEmpty(),
  body('otherConstraints').isArray(),
  intMinZero(body('otherConstraints.*.id').optional()),
  body('otherConstraints.*.detail').isString().not().isEmpty(),
  body('wbsElementStatus').custom((value) => Object.values(WbsElementStatus).includes(value)),
  body('googleDriveFolderLink').isString().not().isEmpty(),
  body('slideDeckLink').isString().not().isEmpty(),
  body('bomLink').isString().not().isEmpty(),
  body('taskListLink').isString().not().isEmpty(),
  intMinZero(body('projectLead').optional()),
  intMinZero(body('projectManager').optional()),
  editProject
);

export default projectRouter;
