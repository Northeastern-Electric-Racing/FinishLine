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
  '/faq/create',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  RecruitmentController.createFaq
);

recruitmentRouter.get('/faqs', RecruitmentController.getAllFaqs)

recruitmentRouter.get('/milestones', RecruitmentController.getAllMilestones);

export default recruitmentRouter;
