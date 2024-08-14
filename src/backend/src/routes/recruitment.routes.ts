import express from 'express';
import { isDate, nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';
import RecruitmentController from '../controllers/recruitment.controllers';

const recruitmentRouter = express.Router();

/* Milestone Section */
recruitmentRouter.get('/milestones', RecruitmentController.getAllMilestones);

recruitmentRouter.post(
  '/milestone/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  isDate(body('dateOfEvent')),
  validateInputs,
  RecruitmentController.createMilestone
);

recruitmentRouter.post(
  '/milestone/:milestoneId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  isDate(body('dateOfEvent')),
  validateInputs,
  RecruitmentController.editMilestone
);

recruitmentRouter.delete('/milestone/:milestoneId/delete', RecruitmentController.deleteMilestone);

/* FAQ Section */

recruitmentRouter.get('/faqs', RecruitmentController.getAllFaqs);

recruitmentRouter.post(
  '/faq/create',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  RecruitmentController.createFaq
);

recruitmentRouter.post(
  '/faq/:faqId/edit',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  RecruitmentController.editFAQ
);

export default recruitmentRouter;
