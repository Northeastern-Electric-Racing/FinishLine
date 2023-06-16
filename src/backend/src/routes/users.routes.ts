import { Theme } from '@prisma/client';
import express from 'express';
import { body } from 'express-validator';
import UsersController from '../controllers/users.controllers';
import { validateInputs } from '../utils/utils';
import { isRole, nonEmptyString } from '../utils/validation.utils';

const userRouter = express.Router();

userRouter.get('/', UsersController.getAllUsers);
userRouter.get('/:userId', UsersController.getSingleUser);
userRouter.get('/:userId/settings', UsersController.getUserSettings);
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

export default userRouter;
