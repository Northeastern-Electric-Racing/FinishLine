import express from 'express';
import { body } from 'express-validator';
import {
  intMinZero,
  decimalMinZero,
  isMaterialStatus,
  nonEmptyString,
  projectValidators,
  validateInputs
} from '../utils/validation.utils';
import ProjectsController from '../controllers/projects.controllers';

const projectRouter = express.Router();

projectRouter.get('/', ProjectsController.getAllProjects);

/* Link Types */
projectRouter.get('/link-types', ProjectsController.getAllLinkTypes);
projectRouter.post(
  '/link-types/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('iconName')),
  body('required').isBoolean(),
  validateInputs,
  ProjectsController.createLinkType
);
projectRouter.post(
  '/link-types/:linkTypeName/edit',
  nonEmptyString(body('iconName')),
  body('required').isBoolean(),
  validateInputs,
  ProjectsController.editLinkType
);

projectRouter.post(
  '/useful-links/edit',
  body('links').isArray(),
  validateInputs,
  ProjectsController.setUsefulLinks
)

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
  nonEmptyString(body('projectId')),
  intMinZero(body('budget')),
  ...projectValidators,
  validateInputs,
  ProjectsController.editProject
);

projectRouter.get('/:wbsNum', ProjectsController.getSingleProject);
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
projectRouter.post(
  '/bom/material-type/create',
  nonEmptyString(body('name')),
  validateInputs,
  ProjectsController.createMaterialType
);
projectRouter.post(
  '/bom/assembly/:wbsNum/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('pdmFileName').optional()),
  validateInputs,
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
  body('notes').isString().optional(),
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
  decimalMinZero(body('quantity')),
  body('unitName').optional(),
  intMinZero(body('price')), // in cents
  intMinZero(body('subtotal')), // in cents
  nonEmptyString(body('linkUrl').isURL()),
  body('notes').isString(),
  validateInputs,
  ProjectsController.editMaterial
);

projectRouter.post(
  '/bom/assembly/:assemblyId/edit',
  nonEmptyString(body('name').optional()),
  nonEmptyString(body('pdmFileName').optional()),
  validateInputs,
  ProjectsController.editAssembly
);

projectRouter.delete('/bom/material-type/:materialTypeId/delete', ProjectsController.deleteMaterialType);

projectRouter.delete('/bom/assembly/:assemblyId/delete', ProjectsController.deleteAssembly);
projectRouter.post('/bom/material/:materialId/delete', ProjectsController.deleteMaterial);

projectRouter.post('/bom/units/create', nonEmptyString(body('name')), validateInputs, ProjectsController.createUnit);
projectRouter.get('/bom/units', ProjectsController.getAllUnits);

projectRouter.delete('/bom/units/:unitId/delete', ProjectsController.deleteUnit);

export default projectRouter;
