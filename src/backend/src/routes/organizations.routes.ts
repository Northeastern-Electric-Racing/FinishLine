import express from 'express';
import { linkValidators, nonEmptyString, validateInputs } from '../utils/validation.utils';
import OrganizationsController from '../controllers/organizations.controller';
import multer, { memoryStorage } from 'multer';
import { body } from 'express-validator';

const organizationRouter = express.Router();
const upload = multer({ limits: { fileSize: 30000000 }, storage: memoryStorage() });

organizationRouter.post('/useful-links/set', ...linkValidators, validateInputs, OrganizationsController.setUsefulLinks);
organizationRouter.get('/useful-links', OrganizationsController.getAllUsefulLinks);
organizationRouter.post(
  '/images/update',
  upload.fields([
    { name: 'applyInterestImage', maxCount: 1 },
    { name: 'exploreAsGuestImage', maxCount: 1 }
  ]),
  OrganizationsController.setImages
);

organizationRouter.get('/images', OrganizationsController.getOrganizationImages);
organizationRouter.post(
  '/featured-projects/set',
  body('projectIds').isArray(),
  nonEmptyString(body('projectIds.*')),
  validateInputs,
  OrganizationsController.setOrganizationFeaturedProjects
);
organizationRouter.post('/logo/update', upload.single('logo'), OrganizationsController.setLogoImage);
organizationRouter.get('/logo', OrganizationsController.getOrganizationLogoImage);
organizationRouter.get('/featured-projects', OrganizationsController.getFeaturedProjects);
export default organizationRouter;
