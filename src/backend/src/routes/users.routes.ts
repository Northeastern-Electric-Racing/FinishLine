import { Theme } from '@prisma/client';
import express from 'express';
import { body } from 'express-validator';
import UsersController from '../controllers/users.controllers';
import { isRole, nonEmptyString, intMinZero, validateInputs, isDate } from '../utils/validation.utils';

const userRouter = express.Router();

userRouter.get('/', UsersController.getAllUsers);
userRouter.get('/:userId', UsersController.getSingleUser);
userRouter.get('/:userId/settings', UsersController.getUserSettings);
userRouter.get('/secure-settings/current-user', UsersController.getCurrentUserSecureSettings);
userRouter.get('/:userId/favorite-projects', UsersController.getUsersFavoriteProjects);
userRouter.post(
  '/:userId/settings',
  body('defaultTheme').isIn([Theme.DARK, Theme.LIGHT]),
  body('slackId').isString(),
  validateInputs,
  UsersController.updateUserSettings
);
userRouter.post('/:userId/change-role', isRole(body('role')), validateInputs, UsersController.updateUserRole);
userRouter.post('/auth/login', UsersController.logUserIn);
userRouter.post('/auth/login/dev', UsersController.logUserInDev);
userRouter.post(
  '/secure-settings/set',
  nonEmptyString(body('nuid')),
  nonEmptyString(body('street')),
  nonEmptyString(body('city')),
  nonEmptyString(body('state')),
  nonEmptyString(body('zipcode')),
  nonEmptyString(body('phoneNumber')),
  UsersController.setUserSecureSettings
);

userRouter.post(
  '/schedule-settings/set',
  body('personalGmail').isString(),
  body('personalZoomLink').isString(),
  body('availability').isArray(),
  body('availability.*.availability').isArray(),
  intMinZero(body('availability.*.availability.*')),
  isDate(body('availability.*.dateSet')),
  validateInputs,
  UsersController.setUserScheduleSettings
);

userRouter.get('/:userId/secure-settings', UsersController.getUserSecureSettings);
userRouter.get('/:userId/schedule-settings', UsersController.getUserScheduleSettings);

export default userRouter;
