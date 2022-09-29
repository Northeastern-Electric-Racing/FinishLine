import express from 'express';
import { body } from 'express-validator';
import { WbsElementStatus } from 'shared';
import {
  createWorkPackage,
  editWorkPackage,
  getAllWorkPackages,
  getSingleWorkPackage
} from '../controllers/work-packages.controllers';
import intMinZero from 'validate.util.ts';
const workPackagesRouter = express.Router();

workPackagesRouter.get('/', getAllWorkPackages);
workPackagesRouter.get('/:wbsNum', getSingleWorkPackage);
workPackagesRouter.post(
  '/create',
  intMinZero(body('userId')),
  intMinZero(body('crId')),
  body('name').isString().not().isEmpty(),
  intMinZero(body('projectWbsNum.carNumber')),
  intMinZero(body('projectWbsNum.projectNumber')),
  intMinZero(body('projectWbsNum.workPackageNumber')),
  body('startDate').isDate(),
  intMinZero(body('duration')),
  intMinZero(body('dependencies.*.carNumber')),
  intMinZero(body('dependencies.*.projectNumber')),
  intMinZero(body('dependencies.*.workPackageNumber')),
  body('expectedActivities').isArray(),
  body('expectedActivities.*').isString().not().isEmpty(),
  body('deliverables').isArray(),
  body('deliverables.*').isString().not().isEmpty(),
  createWorkPackage
);
workPackagesRouter.post(
  '/edit',
  intMinZero(body('workPackageId')),
  intMinZero(body('userId')),
  intMinZero(body('crId')),
  body('name').isString().not().isEmpty(),
  body('startDate').isDate(),
  intMinZero(body('duration')),
  intMinZero(body('dependencies.*.carNumber')),
  intMinZero(body('dependencies.*.projectNumber')),
  intMinZero(body('dependencies.*.workPackageNumber')),
  body('expectedActivities').isArray(),
  body('expectedActivities.*.id').isInt({ min: -1 }).not().isString(),
  body('expectedActivities.*.detail').isString().not().isEmpty(),
  body('deliverables').isArray(),
  body('deliverables.*.id').isInt({ min: -1 }).not().isString(),
  body('deliverables.*.detail').isString().not().isEmpty(),
  body('wbsElementStatus').custom((value) => Object.values(WbsElementStatus).includes(value)),
  intMinZero(body('progress')),
  intMinZero(body('projectLead').optional()),
  intMinZero(body('projectManager').optional()),
  editWorkPackage
);

export default workPackagesRouter;
