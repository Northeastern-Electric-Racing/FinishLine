import express from 'express';
import { linkValidators, validateInputs } from '../utils/validation.utils';
import OrganizationsController from '../controllers/organizations.controller';

const organizationRouter = express.Router();

organizationRouter.post('/useful-links/set', ...linkValidators, validateInputs, OrganizationsController.setUsefulLinks);

export default organizationRouter;
