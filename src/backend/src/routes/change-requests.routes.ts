import express from 'express';
import { body } from 'express-validator';
import { ChangeRequestReason, ChangeRequestType } from 'shared';
import ChangeRequestsController from '../controllers/change-requests.controllers';
import { validateInputs } from '../utils/utils';
import { intMinZero, isDate, isWorkPackageStageOrNone, nonEmptyString } from '../utils/validation.utils';

const changeRequestsRouter = express.Router();

changeRequestsRouter.get('/', ChangeRequestsController.getAllChangeRequests);

changeRequestsRouter.get('/:crId', ChangeRequestsController.getChangeRequestByID);

const wbsProposedChangesValidators = [
  body('wbsProposedChanges'),
  nonEmptyString(body('wbsProposedChanges.*.name')),
  nonEmptyString(body('wbsProposedChanges.*.status')),
  body('wbsProposedChanges.*.links').isArray(),
  nonEmptyString(body('wbsProposedChanges.*.links.*.url')),
  nonEmptyString(body('wbsProposedChanges.*.links.*.linkTypeName')),
  intMinZero(body('wbsProposedChanges.*.projectLeadId')),
  intMinZero(body('wbsProposedChanges.*.projectManagerId'))
];

const projectProposedChangesValidators = [
  body('projectProposedChanges').optional(),
  nonEmptyString(body('projectProposedChanges.*.name')),
  nonEmptyString(body('projectProposedChanges.*.summary')),
  body('projectProposedChanges.*.rules').isArray(),
  nonEmptyString(body('projectProposedChanges.*.rules.*')),
  body('projectProposedChanges.*.goals').isArray(),
  body('projectProposedChanges.*.goals.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('projectProposedChanges.*.goals.*.detail')),
  body('projectProposedChanges.*.features').isArray(),
  body('projectProposedChanges.*.features.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('projectProposedChanges.*.features.*.detail')),
  body('projectProposedChanges.*.otherConstraints').isArray(),
  body('projectProposedChanges.*.otherConstraints.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('projectProposedChanges.*.otherConstraints.*.detail'))
];

const workPackageProposedChangesValidators = [
  body('workPackageProposedChanges').optional(),
  isWorkPackageStageOrNone(body('stage')),
  isDate(body('startDate')),
  intMinZero(body('duration')),
  body('blockedBy').isArray(),
  intMinZero(body('blockedBy.*.carNumber')),
  intMinZero(body('blockedBy.*.projectNumber')),
  intMinZero(body('blockedBy.*.workPackageNumber')),
  body('expectedActivities').isArray(),
  nonEmptyString(body('expectedActivities.*')),
  body('deliverables').isArray(),
  nonEmptyString(body('deliverables.*'))
];

changeRequestsRouter.post(
  '/review',
  intMinZero(body('reviewerId')),
  intMinZero(body('crId')),
  body('reviewNotes').isString(),
  body('accepted').isBoolean(),
  body('psId').optional().isString().not().isEmpty(),
  validateInputs,
  ChangeRequestsController.reviewChangeRequest
);

changeRequestsRouter.post(
  '/new/activation',
  intMinZero(body('submitterId')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('type').custom((value) => value === ChangeRequestType.Activation),
  body('startDate').custom((value) => !isNaN(Date.parse(value))),
  intMinZero(body('projectLeadId')),
  intMinZero(body('projectManagerId')),
  body('confirmDetails').isBoolean(),
  validateInputs,
  ChangeRequestsController.createActivationChangeRequest
);

changeRequestsRouter.post(
  '/new/stage-gate',
  intMinZero(body('submitterId')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('type').custom((value) => value === ChangeRequestType.StageGate),
  body('confirmDone').isBoolean(),
  validateInputs,
  ChangeRequestsController.createStageGateChangeRequest
);

changeRequestsRouter.post(
  '/new/standard',
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('type').custom(
    (value) =>
      value === ChangeRequestType.Other || value === ChangeRequestType.Issue || value === ChangeRequestType.Redefinition
  ),
  body('why').isArray(),
  nonEmptyString(body('why.*.explain')),
  body('why.*.type').custom((value) => Object.values(ChangeRequestReason).includes(value)),
  body('proposedSolutions').isArray({ min: 1 }),
  nonEmptyString(body('proposedSolutions.*.description')),
  nonEmptyString(body('proposedSolutions.*.scopeImpact')),
  body('proposedSolutions.*.timelineImpact').isInt(),
  body('proposedSolutions.*.budgetImpact').isInt(),
  ...wbsProposedChangesValidators,
  ...projectProposedChangesValidators,
  ...workPackageProposedChangesValidators,
  validateInputs,
  ChangeRequestsController.createStandardChangeRequest
);

changeRequestsRouter.delete('/:crId/delete', ChangeRequestsController.deleteChangeRequest);

changeRequestsRouter.post(
  '/new/proposed-solution',
  intMinZero(body('submitterId')),
  intMinZero(body('crId')),
  nonEmptyString(body('description')),
  nonEmptyString(body('scopeImpact')),
  body('timelineImpact').isInt(),
  body('budgetImpact').isInt(),
  validateInputs,
  ChangeRequestsController.addProposedSolution
);

changeRequestsRouter.post(
  '/:crId/request-review',
  body('userIds').isArray(),
  intMinZero(body('userIds.*')),
  validateInputs,
  ChangeRequestsController.requestCRReview
);

export default changeRequestsRouter;
