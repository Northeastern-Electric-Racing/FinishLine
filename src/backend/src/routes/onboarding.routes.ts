import express from 'express';
import OnboardingController from '../controllers/onboarding.controller';

const onboardingRouter = express.Router();

onboardingRouter.get('/image/:fileId', OnboardingController.downloadImage);

export default onboardingRouter;
