import express from 'express';
import { linkValidators, nonEmptyString, validateInputs } from '../utils/validation.utils';
import OrganizationsController from '../controllers/organizations.controllers';
import multer, { memoryStorage } from 'multer';
import { body } from 'express-validator';
import { MAX_FILE_SIZE } from 'shared';

const organizationRouter = express.Router();
const upload = multer({ limits: { fileSize: MAX_FILE_SIZE }, storage: memoryStorage() });

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
organizationRouter.post('/new-member-image/update', upload.single('newMemberImage'), OrganizationsController.setNewMemberImage);
organizationRouter.get('/new-member-image', OrganizationsController.getOrganizationNewMemberImage);
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
  validateInputs,
  OrganizationsController.setSlackWorkspaceId
);

organizationRouter.get('/part-review-guide-link/get', OrganizationsController.getPartReviewGuideLink);
organizationRouter.post('/part-review-guide-link/set', OrganizationsController.setPartReviewGuideLink);

organizationRouter.post(
  '/sponsorshipChannelId/set',
  nonEmptyString(body('channelId')),
  validateInputs,
  OrganizationsController.setSlackSponsorshipNotificationsSlackId
);

organizationRouter.get('/finance-delegates', OrganizationsController.getFinanceDelegates);
organizationRouter.post(
  '/finance-delegates/set',
  body('userIds').isArray(),
  nonEmptyString(body('userIds.*')),
  validateInputs,
  OrganizationsController.setFinanceDelegates
);

export default organizationRouter;
