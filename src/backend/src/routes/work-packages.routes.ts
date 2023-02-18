import express from 'express';
import { body } from 'express-validator';
import { WbsElementStatus } from 'shared';
import WorkPackagesController from '../controllers/work-packages.controllers';
import { validateInputs } from '../utils/utils';
import { intMinZero, isDate, nonEmptyString } from '../utils/validation.utils';
const workPackagesRouter = express.Router();

workPackagesRouter.get('/', WorkPackagesController.getAllWorkPackages);
workPackagesRouter.get('/:wbsNum', WorkPackagesController.getSingleWorkPackage);
workPackagesRouter.post(
  '/create',
  intMinZero(body('crId')),
  nonEmptyString(body('name')),
  intMinZero(body('projectWbsNum.carNumber')),
  intMinZero(body('projectWbsNum.projectNumber')),
  intMinZero(body('projectWbsNum.workPackageNumber')),
  nonEmptyString(body('stage')),
  isDate(body('startDate')),
  intMinZero(body('duration')),
  intMinZero(body('dependencies.*.carNumber')),
  intMinZero(body('dependencies.*.projectNumber')),
  intMinZero(body('dependencies.*.workPackageNumber')),
  body('expectedActivities').isArray(),
  nonEmptyString(body('expectedActivities.*')),
  body('deliverables').isArray(),
  nonEmptyString(body('deliverables.*')),
  validateInputs,
  WorkPackagesController.createWorkPackage
);
workPackagesRouter.post(
  '/edit',
  intMinZero(body('workPackageId')),
  intMinZero(body('crId')),
  nonEmptyString(body('name')),
  body('startDate').isDate(),
  intMinZero(body('duration')),
  intMinZero(body('dependencies.*.carNumber')),
  intMinZero(body('dependencies.*.projectNumber')),
  intMinZero(body('dependencies.*.workPackageNumber')),
  body('expectedActivities').isArray(),
  body('expectedActivities.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('expectedActivities.*.detail')),
  body('deliverables').isArray(),
  body('deliverables.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('deliverables.*.detail')),
  body('wbsElementStatus').custom((value) => Object.values(WbsElementStatus).includes(value)),
  intMinZero(body('projectLead').optional()),
  intMinZero(body('projectManager').optional()),
  validateInputs,
  WorkPackagesController.editWorkPackage
);

export default workPackagesRouter;
