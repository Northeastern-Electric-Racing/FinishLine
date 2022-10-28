import express from 'express';
import { body } from 'express-validator';
import { WbsElementStatus } from 'shared';
import {
  createWorkPackage,
  editWorkPackage,
  getAllWorkPackages,
  getSingleWorkPackage
} from '../controllers/work-packages.controllers';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';
const workPackagesRouter = express.Router();

workPackagesRouter.get('/', getAllWorkPackages);
workPackagesRouter.get('/:wbsNum', getSingleWorkPackage);
workPackagesRouter.post(
  '/create',
  intMinZero(body('userId')),
  intMinZero(body('crId')),
  nonEmptyString(body('name')),
  intMinZero(body('projectWbsNum.carNumber')),
  intMinZero(body('projectWbsNum.projectNumber')),
  intMinZero(body('projectWbsNum.workPackageNumber')),
  body('startDate').isDate(),
  intMinZero(body('duration')),
  intMinZero(body('dependencies.*.carNumber')),
  intMinZero(body('dependencies.*.projectNumber')),
  intMinZero(body('dependencies.*.workPackageNumber')),
  body('expectedActivities').isArray(),
  nonEmptyString(body('expectedActivities.*')),
  body('deliverables').isArray(),
  nonEmptyString(body('deliverables.*')),
  createWorkPackage
);
workPackagesRouter.post(
  '/edit',
  intMinZero(body('workPackageId')),
  intMinZero(body('userId')),
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
  editWorkPackage
);

export default workPackagesRouter;
