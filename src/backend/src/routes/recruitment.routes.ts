import express from 'express';
import { isDateOnly, nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import { body } from 'express-validator';
import RecruitmentController from '../controllers/recruitment.controllers.js';

const recruitmentRouter = express.Router();

/* Milestone Section */
recruitmentRouter.get('/milestones', RecruitmentController.getAllMilestones);

recruitmentRouter.post(
  '/milestone/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  isDateOnly(body('dateOfEvent')),
  validateInputs,
  RecruitmentController.createMilestone
);

recruitmentRouter.post(
  '/milestone/:milestoneId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  isDateOnly(body('dateOfEvent')),
  validateInputs,
  RecruitmentController.editMilestone
);

recruitmentRouter.delete('/milestone/:milestoneId/delete', RecruitmentController.deleteMilestone);

/* FAQ Section */

recruitmentRouter.get('/faqs', RecruitmentController.getAllOrganizationFaqs);

recruitmentRouter.post(
  '/faq/create',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  RecruitmentController.createOrganizationFaq
);

recruitmentRouter.post(
  '/faq/:faqId/edit',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  RecruitmentController.editFAQ
);

recruitmentRouter.delete('/faq/:faqId/delete', RecruitmentController.deleteFaq);

/* Guest Definition Section */

recruitmentRouter.post(
  '/guestdefinition/create',
  nonEmptyString(body('term')),
  nonEmptyString(body('description')),
  body('order').isInt(),
  nonEmptyString(body('icon')).optional(),
  nonEmptyString(body('buttonText')).optional(),
  nonEmptyString(body('buttonLink')).optional(),
  validateInputs,
  RecruitmentController.createGuestDefinition
);

recruitmentRouter.get('/guestdefinition/:definitionId', RecruitmentController.getGuestDefinition);

recruitmentRouter.post(
  '/guestDefinition/:guestId/edit',
  nonEmptyString(body('term')),
  nonEmptyString(body('description')),
  body('order').isInt(),
  nonEmptyString(body('icon')).optional(),
  nonEmptyString(body('buttonText')).optional(),
  nonEmptyString(body('buttonLink')).optional(),
  validateInputs,
  RecruitmentController.editGuestDefinition
);

recruitmentRouter.delete('/guestdefinition/:definitionId/delete', RecruitmentController.deleteGuestDefinition);
recruitmentRouter.get('/guestdefinitions', RecruitmentController.getAllGuestDefintions);

export default recruitmentRouter;
