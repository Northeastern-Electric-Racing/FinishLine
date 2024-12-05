import express from 'express';
import { linkValidators, validateInputs, nonEmptyString } from '../utils/validation.utils';
import OrganizationsController from '../controllers/organizations.controller';
import multer, { memoryStorage } from 'multer';
import { body } from 'express-validator';

const organizationRouter = express.Router();
const upload = multer({ limits: { fileSize: 30000000 }, storage: memoryStorage() });

organizationRouter.get('/current', OrganizationsController.getCurrentOrganization);
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
  '/application-link/update',
  nonEmptyString(body('applicationLink')),
  validateInputs,
  OrganizationsController.updateApplicationLink
);
organizationRouter.post(
  '/onboardingText/set',
  nonEmptyString(body('onboardingText')),
  validateInputs,
  OrganizationsController.setOnboardingText
);

export default organizationRouter;
