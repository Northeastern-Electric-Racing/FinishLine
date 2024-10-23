import express from 'express';
import OnboardingController from '../controllers/onboarding.controllers';

const onboardingRouter = express.Router();

/* User Checklists Section */
onboardingRouter.get('/checklists/:userId', OnboardingController.getUsersChecklists);

export default onboardingRouter;
