import express from 'express';
import { isDate, nonEmptyString, validateInputs } from '../utils/validation.utils';
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

recruitmentRouter.post(
  '/faq/:faqId/edit',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  RecruitmentController.editFAQ
);

recruitmentRouter.post('/');

export default recruitmentRouter;
