import express from 'express';
import { linkValidators, validateInputs } from '../utils/validation.utils';
import OrganizationsController from '../controllers/organizations.controller';
import multer, { memoryStorage } from 'multer';

const organizationRouter = express.Router();
const upload = multer({ limits: { fileSize: 30000000 }, storage: memoryStorage() });

organizationRouter.post('/useful-links/set', ...linkValidators, validateInputs, OrganizationsController.setUsefulLinks);
organizationRouter.get('/useful-links', OrganizationsController.getAllUsefulLinks);
organizationRouter.post('/images/update', upload.array('image'), OrganizationsController.setImages);

export default organizationRouter;
