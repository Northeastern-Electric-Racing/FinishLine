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
  body('userId').isInt({ min: 0 }),
  body('crId').isInt({ min: 0 }),
  body('name').not().isEmpty(),
  body('projectWbsNum.carNumber').isInt({ min: 0 }),
  body('projectWbsNum.projectNumber').isInt({ min: 0 }),
  body('projectWbsNum.workPackageNumber').isInt({ min: 0 }),
  body('startDate').isDate(),
  body('duration').isInt({ min: 0 }),
  body('dependencies.*.carNumber').isInt({ min: 0 }),
  body('dependencies.*.projectNumber').isInt({ min: 0 }),
  body('dependencies.*.workPackageNumber').isInt({ min: 0 }),
  body('expectedActivities').isArray(),
  body('expectedActivities.*').isString(),
  body('expectedActivities.*').not().isEmpty(),
  body('deliverables').isArray(),
  body('deliverables.*').isString(),
  body('deliverables.*').not().isEmpty(),
  createWorkPackage
);
workPackagesRouter.post(
  '/edit',
  body('workPackageId').isInt({ min: 0 }),
  body('userId').isInt({ min: 0 }),
  body('crId').isInt({ min: 0 }),
  body('name').not().isEmpty(),
  body('startDate').isDate(),
  body('duration').isInt({ min: 0 }),
  body('dependencies.*.carNumber').isInt({ min: 0 }),
  body('dependencies.*.projectNumber').isInt({ min: 0 }),
  body('dependencies.*.workPackageNumber').isInt({ min: 0 }),
  body('expectedActivities').isArray(),
  body('expectedActivities.*.id').isInt({ min: 0 }),
  body('expectedActivities.*.detail').not().isEmpty(),
  body('deliverables').isArray(),
  body('deliverables.*.id').isInt({ min: 0 }),
  body('deliverables.*.detail').not().isEmpty(),
  body('wbsElementStatus').custom((value) => Object.values(WbsElementStatus).includes(value)),
  body('progress').isInt({ min: 0 }),
  body('projectLead').optional().isInt({ min: 0 }),
  body('projectManager').optional().isInt({ min: 0 }),
  editWorkPackage
);

export default workPackagesRouter;
