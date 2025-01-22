import express from 'express';
import { linkValidators, nonEmptyString, validateInputs } from '../utils/validation.utils';
import OrganizationsController from '../controllers/organizations.controllers';
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

organizationRouter.post(
  '/contacts/set',
  body('contacts').isArray(),
  nonEmptyString(body('contacts.*.userId')),
  nonEmptyString(body('contacts.*.title')),
  validateInputs,
  OrganizationsController.updateOrganizationContacts
);

organizationRouter.post(
  '/featured-projects/set',
  body('projectIds').isArray(),
  nonEmptyString(body('projectIds.*')),
  validateInputs,
  OrganizationsController.setOrganizationFeaturedProjects
);
organizationRouter.post('/logo/update', upload.single('logo'), OrganizationsController.setLogoImage);
organizationRouter.get('/logo', OrganizationsController.getOrganizationLogoImage);
organizationRouter.post(
  '/description/set',
  body('description').isString(),
  validateInputs,
  OrganizationsController.setOrganizationDescription
);
organizationRouter.get('/featured-projects', OrganizationsController.getOrganizationFeaturedProjects);
organizationRouter.post(
  '/workspaceId/set',
  nonEmptyString(body('workspaceId')),
  OrganizationsController.setSlackWorkspaceId
);
export default organizationRouter;
