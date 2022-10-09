import express from 'express';
import { body } from 'express-validator';
import { WbsElementStatus } from 'shared';
import {
  createWorkPackage,
  editWorkPackage,
  getAllWorkPackages,
  getSingleWorkPackage
} from '../controllers/work-packages.controllers';

const workPackagesRouter = express.Router();

workPackagesRouter.get('/', getAllWorkPackages);
workPackagesRouter.get('/:wbsNum', getSingleWorkPackage);
workPackagesRouter.post(
  '/create',
  body('userId').isInt({ min: 0 }).not().isString(),
  body('crId').isInt({ min: 0 }).not().isString(),
  body('name').isString().not().isEmpty(),
  body('projectWbsNum.carNumber').isInt({ min: 0 }).not().isString(),
  body('projectWbsNum.projectNumber').isInt({ min: 0 }).not().isString(),
  body('projectWbsNum.workPackageNumber').isInt({ min: 0 }).not().isString(),
  body('startDate').isDate(),
  body('duration').isInt({ min: 0 }).not().isString(),
  body('dependencies.*.carNumber').isInt({ min: 0 }).not().isString(),
  body('dependencies.*.projectNumber').isInt({ min: 0 }).not().isString(),
  body('dependencies.*.workPackageNumber').isInt({ min: 0 }).not().isString(),
  body('expectedActivities').isArray(),
  body('expectedActivities.*').isString().not().isEmpty(),
  body('deliverables').isArray(),
  body('deliverables.*').isString().not().isEmpty(),
  createWorkPackage
);
workPackagesRouter.post(
  '/edit',
  body('workPackageId').isInt({ min: 0 }).not().isString(),
  body('userId').isInt({ min: 0 }).not().isString(),
  body('crId').isInt({ min: 0 }).not().isString(),
  body('name').isString().not().isEmpty(),
  body('startDate').isDate(),
  body('duration').isInt({ min: 0 }).not().isString(),
  body('dependencies.*.carNumber').isInt({ min: 0 }).not().isString(),
  body('dependencies.*.projectNumber').isInt({ min: 0 }).not().isString(),
  body('dependencies.*.workPackageNumber').isInt({ min: 0 }).not().isString(),
  body('expectedActivities').isArray(),
  body('expectedActivities.*.id').isInt({ min: -1 }).not().isString(),
  body('expectedActivities.*.detail').isString().not().isEmpty(),
  body('deliverables').isArray(),
  body('deliverables.*.id').isInt({ min: -1 }).not().isString(),
  body('deliverables.*.detail').isString().not().isEmpty(),
  body('wbsElementStatus').custom((value) => Object.values(WbsElementStatus).includes(value)),
  body('progress').isInt({ min: 0 }).not().isString(),
  body('projectLead').optional().isInt({ min: 0 }).not().isString(),
  body('projectManager').optional().isInt({ min: 0 }).not().isString(),
  editWorkPackage
);

export default workPackagesRouter;
