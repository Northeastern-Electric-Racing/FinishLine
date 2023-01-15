import express from 'express';
import {
  editProject,
  getAllProjects,
  getSingleProject,
  newProject,
  setProjectTeam
} from '../controllers/projects.controllers';
import { body } from 'express-validator';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';
import { validateInputs } from '../utils/utils';

const projectRouter = express.Router();

projectRouter.get('/', getAllProjects);
projectRouter.get('/:wbsNum', getSingleProject);
projectRouter.post(
  '/new',
  intMinZero(body('userId')),
  intMinZero(body('crId')),
  nonEmptyString(body('name')),
  intMinZero(body('carNumber')),
  nonEmptyString(body('summary')),
  validateInputs,
  newProject
);
projectRouter.post(
  '/edit',
  intMinZero(body('projectId')),
  intMinZero(body('crId')),
  nonEmptyString(body('name')),
  intMinZero(body('userId')),
  intMinZero(body('budget')),
  nonEmptyString(body('summary')),
  body('rules').isArray(),
  nonEmptyString(body('rules.*')),
  body('goals').isArray(),
  intMinZero(body('goals.*.id').optional()),
  nonEmptyString(body('goals.*.detail')),
  body('features').isArray(),
  intMinZero(body('features.*.id').optional()),
  nonEmptyString(body('features.*.detail')),
  body('otherConstraints').isArray(),
  intMinZero(body('otherConstraints.*.id').optional()),
  nonEmptyString(body('otherConstraints.*.detail')),
  nonEmptyString(body('googleDriveFolderLink')),
  nonEmptyString(body('slideDeckLink')),
  nonEmptyString(body('bomLink')),
  nonEmptyString(body('taskListLink')),
  intMinZero(body('projectLead').optional()),
  intMinZero(body('projectManager').optional()),
  validateInputs,
  editProject
);
projectRouter.post('/:wbsNum/set-team', nonEmptyString(body('teamId')), validateInputs, setProjectTeam);

export default projectRouter;
