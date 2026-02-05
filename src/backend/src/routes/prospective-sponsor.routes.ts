import express from 'express';
import { body } from 'express-validator';
import {
  nonEmptyString,
  validateInputs,
  isDate,
  isOptionalDate,
  intMinZero
} from '../utils/validation.utils.js';
import ProspectiveSponsorController from '../controllers/prospective-sponsor.controllers.js';

const prospectiveSponsorRouter = express.Router();

// Create prospective sponsor
prospectiveSponsorRouter.post(
  '/create',
  nonEmptyString(body('organizationName')),
  isDate(body('lastContactDate')),
  nonEmptyString(body('firstContactMethod')),
  nonEmptyString(body('contactName')),
  nonEmptyString(body('contactorUserId')),
  intMinZero(body('highlightThresholdDays')).optional(),
  nonEmptyString(body('contactEmail')).optional(),
  nonEmptyString(body('contactPhone')).optional(),
  nonEmptyString(body('contactPosition')).optional(),
  validateInputs,
  ProspectiveSponsorController.createProspectiveSponsor
);

// Get all prospective sponsors
prospectiveSponsorRouter.get('/', ProspectiveSponsorController.getAllProspectiveSponsors);

// Edit prospective sponsor
prospectiveSponsorRouter.post(
  '/:prospectiveSponsorId/edit',
  nonEmptyString(body('organizationName')),
  isDate(body('lastContactDate')),
  nonEmptyString(body('status')),
  nonEmptyString(body('firstContactMethod')),
  nonEmptyString(body('contactName')),
  nonEmptyString(body('contactorUserId')),
  intMinZero(body('highlightThresholdDays')).optional(),
  nonEmptyString(body('contactEmail')).optional(),
  nonEmptyString(body('contactPhone')).optional(),
  nonEmptyString(body('contactPosition')).optional(),
  validateInputs,
  ProspectiveSponsorController.editProspectiveSponsor
);

// Delete prospective sponsor
prospectiveSponsorRouter.post(
  '/:prospectiveSponsorId/delete',
  ProspectiveSponsorController.deleteProspectiveSponsor
);

// Get tasks for prospective sponsor
prospectiveSponsorRouter.get(
  '/:prospectiveSponsorId/tasks',
  ProspectiveSponsorController.getProspectiveSponsorTasks
);

// Create task for prospective sponsor
prospectiveSponsorRouter.post(
  '/:prospectiveSponsorId/tasks',
  isDate(body('dueDate')),
  nonEmptyString(body('notes')),
  isOptionalDate(body('notifyDate')),
  nonEmptyString(body('assigneeUserId')).optional(),
  validateInputs,
  ProspectiveSponsorController.createProspectiveSponsorTask
);

// Accept prospective sponsor (convert to full sponsor)
prospectiveSponsorRouter.post(
  '/:prospectiveSponsorId/accept',
  nonEmptyString(body('sponsorTierId')),
  body('sponsorValue').isInt(),
  isDate(body('joinDate')),
  body('activeYears').isArray(),
  intMinZero(body('activeYears.*')),
  body('taxExempt').isBoolean(),
  nonEmptyString(body('discountCode')).optional(),
  nonEmptyString(body('sponsorNotes')).optional(),
  validateInputs,
  ProspectiveSponsorController.acceptProspectiveSponsor
);

export default prospectiveSponsorRouter;
