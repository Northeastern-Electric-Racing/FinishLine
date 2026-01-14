import express from 'express';
import { body } from 'express-validator';
import {
  intMinZero,
  nonEmptyString,
  projectValidators,
  validateInputs,
  materialValidators
} from '../utils/validation.utils.js';
import ProjectsController from '../controllers/projects.controllers.js';

const projectRouter = express.Router();

projectRouter.get('/all-gantt', ProjectsController.getAllProjectsGantt);
projectRouter.get('/all-previews', ProjectsController.getAllProjects);
projectRouter.get('/users-teams', ProjectsController.getUsersTeamsProjects);
projectRouter.get('/leading', ProjectsController.getUsersLeadingProjects);
projectRouter.get('/teams-projects/:teamId', ProjectsController.getTeamsProjects);

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
  nonEmptyString(body('name').optional()),
  nonEmptyString(body('iconName')),
  body('required').isBoolean(),
  validateInputs,
  ProjectsController.editLinkType
);

projectRouter.post(
  '/create',
  intMinZero(body('carNumber')),
  body('teamIds').isArray(),
  nonEmptyString(body('teamIds.*')),
  body('budget').optional().isInt({ min: 0 }).default(0),
  nonEmptyString(body('crId').optional()),
  ...projectValidators,
  validateInputs,
  ProjectsController.createProject
);
projectRouter.post(
  '/edit',
  nonEmptyString(body('projectId')),
  intMinZero(body('budget')),
  nonEmptyString(body('crId')),
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
  body('pdmFileName').optional().isString(),
  validateInputs,
  ProjectsController.createAssembly
);
projectRouter.post(
  '/bom/material/:materialId/assign-assembly',
  nonEmptyString(body('assemblyId').optional()),
  validateInputs,
  ProjectsController.assignMaterialAssembly
);
projectRouter.post('/bom/material/:wbsNum/create', ...materialValidators, validateInputs, ProjectsController.createMaterial);
projectRouter.post('/bom/material/:materialId/edit', ...materialValidators, validateInputs, ProjectsController.editMaterial);

projectRouter.post(
  '/bom/assembly/:assemblyId/edit',
  nonEmptyString(body('name').optional()),
  body('pdmFileName').optional().isString(),
  validateInputs,
  ProjectsController.editAssembly
);

projectRouter.delete('/bom/material-type/:materialTypeId/delete', ProjectsController.deleteMaterialType);

projectRouter.delete('/bom/assembly/:assemblyId/delete', ProjectsController.deleteAssembly);
projectRouter.post('/bom/material/:materialId/delete', ProjectsController.deleteMaterial);

projectRouter.post('/bom/units/create', nonEmptyString(body('name')), validateInputs, ProjectsController.createUnit);
projectRouter.get('/bom/units', ProjectsController.getAllUnits);

projectRouter.delete('/bom/units/:unitId/delete', ProjectsController.deleteUnit);
projectRouter.get('/bom/:wbsNum/assemblies', ProjectsController.getAssembliesForWbsElement);
projectRouter.get('/bom/:wbsNum/materials', ProjectsController.getMaterialsForWbsElement);
projectRouter.post(
  '/set-abbreviation',
  nonEmptyString(body('wbsNum')),
  nonEmptyString(body('abbreviation')),
  validateInputs,
  ProjectsController.setAbbreviation
);
projectRouter.post('/:wbsNum/delete-abbreviation', ProjectsController.deleteAbbreviation);

export default projectRouter;
