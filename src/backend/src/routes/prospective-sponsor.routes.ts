import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs, isDate, isOptionalDate, intMinZero } from '../utils/validation.utils.js';
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
  nonEmptyString(body('contactEmail')).optional({ checkFalsy: true }),
  nonEmptyString(body('contactPhone')).optional({ checkFalsy: true }),
  nonEmptyString(body('contactPosition')).optional({ checkFalsy: true }),
  nonEmptyString(body('notes')).optional({ checkFalsy: true }),
  body('tasks').optional().isArray(),
  isDate(body('tasks.*.dueDate')).optional(),
  isDate(body('tasks.*.notifyDate')).optional({ checkFalsy: true }),
  nonEmptyString(body('tasks.*.assigneeUserId')).optional({ checkFalsy: true }),
  nonEmptyString(body('tasks.*.notes')).optional(),
  body('tasks.*.done').optional().isBoolean(),
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
  nonEmptyString(body('contactEmail')).optional({ checkFalsy: true }),
  nonEmptyString(body('contactPhone')).optional({ checkFalsy: true }),
  nonEmptyString(body('contactPosition')).optional({ checkFalsy: true }),
  nonEmptyString(body('notes')).optional({ checkFalsy: true }),
  body('tasks').optional().isArray(),
  nonEmptyString(body('tasks.*.sponsorTaskId')).optional({ checkFalsy: true }),
  isDate(body('tasks.*.dueDate')).optional(),
  isDate(body('tasks.*.notifyDate')).optional({ checkFalsy: true }),
  nonEmptyString(body('tasks.*.assigneeUserId')).optional({ checkFalsy: true }),
  nonEmptyString(body('tasks.*.notes')).optional(),
  body('tasks.*.done').optional().isBoolean(),
  validateInputs,
  ProspectiveSponsorController.editProspectiveSponsor
);

// Delete prospective sponsor
prospectiveSponsorRouter.post('/:prospectiveSponsorId/delete', ProspectiveSponsorController.deleteProspectiveSponsor);

// Get tasks for prospective sponsor
prospectiveSponsorRouter.get('/:prospectiveSponsorId/tasks', ProspectiveSponsorController.getProspectiveSponsorTasks);

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
  nonEmptyString(body('sponsorTierId')).optional({ checkFalsy: true }),
  body('valueTypes').isArray(),
  nonEmptyString(body('valueTypes.*')),
  body('sponsorValue').isInt().optional(),
  isDate(body('joinDate')),
  body('activeYears').isArray(),
  intMinZero(body('activeYears.*')),
  body('taxExempt').isBoolean(),
  nonEmptyString(body('discountCode')).optional({ checkFalsy: true }),
  nonEmptyString(body('sponsorNotes')).optional({ checkFalsy: true }),
  nonEmptyString(body('stockDescription')).optional({ checkFalsy: true }),
  nonEmptyString(body('discountDescription')).optional({ checkFalsy: true }),
  validateInputs,
  ProspectiveSponsorController.acceptProspectiveSponsor
);

export default prospectiveSponsorRouter;
