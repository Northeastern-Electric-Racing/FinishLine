import express from 'express';
import { isDate, linkValidators, nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';
import RecruitmentController from '../controllers/recruitment.controllers';

const recruitmentRouter = express.Router();

recruitmentRouter.post(
  '/milestone/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  isDate(body('dateOfEvent')),
  validateInputs,
  RecruitmentController.createMilestone
);

export default recruitmentRouter;
