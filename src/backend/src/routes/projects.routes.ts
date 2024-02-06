import express from 'express';
import { body } from 'express-validator';
import { intMinZero, decimalMinZero, isMaterialStatus, nonEmptyString } from '../utils/validation.utils';
import { validateInputs } from '../utils/utils';
import ProjectsController from '../controllers/projects.controllers';

const projectRouter = express.Router();

projectRouter.get('/', ProjectsController.getAllProjects);
projectRouter.get('/link-types', ProjectsController.getAllLinkTypes);
projectRouter.get('/:wbsNum', ProjectsController.getSingleProject);

const projectValidators = [
  intMinZero(body('crId')),
  nonEmptyString(body('name')),
  nonEmptyString(body('summary')),
  body('rules').isArray(),
  nonEmptyString(body('rules.*')),
  body('goals').isArray(),
  body('goals.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('goals.*.detail')),
  body('features').isArray(),
  body('features.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('features.*.detail')),
  body('otherConstraints').isArray(),
  body('otherConstraints.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('otherConstraints.*.detail')),
  body('links').isArray(),
  nonEmptyString(body('links.*.url')),
  nonEmptyString(body('links.*.linkTypeName')),
  intMinZero(body('projectLeadId').optional()),
  intMinZero(body('projectManagerId').optional())
];

projectRouter.post(
  '/link-types/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('iconName')),
  body('required').isBoolean(),
  validateInputs,
  ProjectsController.createLinkType
);

projectRouter.post(
  '/create',
  intMinZero(body('carNumber')),
  body('teamIds').isArray(),
  nonEmptyString(body('teamIds.*')),
  body('budget').optional().isInt({ min: 0 }).default(0),
  ...projectValidators,
  validateInputs,
  ProjectsController.createProject
);
projectRouter.post(
  '/edit',
  intMinZero(body('projectId')),
  intMinZero(body('budget')),
  ...projectValidators,
  validateInputs,
  ProjectsController.editProject
);
projectRouter.post('/:wbsNum/set-team', nonEmptyString(body('teamId')), validateInputs, ProjectsController.setProjectTeam);
projectRouter.delete('/:wbsNum/delete', ProjectsController.deleteProject);
projectRouter.post('/:wbsNum/favorite', ProjectsController.toggleFavorite);

/**************** BOM Section ****************/
projectRouter.post(
  '/bom/manufacturer/create',
  nonEmptyString(body('name')),
  validateInputs,
  ProjectsController.createManufacturer
);
projectRouter.delete('/bom/manufacturer/:manufacturerName/delete', ProjectsController.deleteManufacturer);
projectRouter.get('/bom/manufacturer', ProjectsController.getAllManufacturers);
projectRouter.get('/bom/material-type', ProjectsController.getAllMaterialTypes);
projectRouter.post('/bom/material-type/create', nonEmptyString(body('name')), ProjectsController.createMaterialType);
projectRouter.post(
  '/bom/assembly/:wbsNum/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('pdmFileName').optional()),
  ProjectsController.createAssembly
);
projectRouter.post(
  '/bom/material/:materialId/assign-assembly',
  nonEmptyString(body('assemblyId').optional()),
  validateInputs,
  ProjectsController.assignMaterialAssembly
);
projectRouter.post(
  '/bom/material/:wbsNum/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('assemblyId').optional()),
  isMaterialStatus(body('status')),
  nonEmptyString(body('materialTypeName')),
  nonEmptyString(body('manufacturerName')),
  nonEmptyString(body('manufacturerPartNumber')),
  nonEmptyString(body('pdmFileName').optional()),
  decimalMinZero(body('quantity')),
  nonEmptyString(body('unitName')).optional(),
  intMinZero(body('price')), // in cents
  intMinZero(body('subtotal')), // in cents
  nonEmptyString(body('linkUrl').isURL()),
  body('notes').optional(),
  validateInputs,
  ProjectsController.createMaterial
);
projectRouter.post(
  '/bom/material/:materialId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('assemblyId').optional()),
  isMaterialStatus(body('status')),
  nonEmptyString(body('materialTypeName')),
  nonEmptyString(body('manufacturerName')),
  nonEmptyString(body('manufacturerPartNumber')),
  nonEmptyString(body('pdmFileName').optional()),
  intMinZero(body('quantity')),
  body('unitName').optional(),
  intMinZero(body('price')), // in cents
  intMinZero(body('subtotal')), // in cents
  nonEmptyString(body('linkUrl').isURL()),
  body('notes').isString(),
  validateInputs,
  ProjectsController.editMaterial
);

projectRouter.delete('/bom/material-type/:materialTypeId/delete', ProjectsController.deleteMaterialType);

projectRouter.delete('/bom/assembly/:assemblyId/delete', ProjectsController.deleteAssemblyType);
projectRouter.post('/bom/material/:materialId/delete', ProjectsController.deleteMaterial);

projectRouter.post('/bom/units/create', nonEmptyString(body('name')), ProjectsController.createUnit);
projectRouter.get('/bom/units', ProjectsController.getAllUnits);

projectRouter.delete('/bom/units/:unitId/delete', ProjectsController.deleteUnit);

projectRouter.post(
  '/link-types/:linkTypeId/edit',
  nonEmptyString(body('iconName')),
  body('required').isBoolean(),
  validateInputs,
  ProjectsController.editLinkType
);

export default projectRouter;
