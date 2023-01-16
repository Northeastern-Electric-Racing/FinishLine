import { Theme } from '@prisma/client';
import express from 'express';
import { body } from 'express-validator';
import UsersController from '../controllers/users.controllers';
import { intMinZero, isRole } from '../utils/validation.utils';

const userRouter = express.Router();

userRouter.get('/', UsersController.getAllUsers);
userRouter.get('/:userId', UsersController.getSingleUser);
userRouter.get('/:userId/settings', UsersController.getUserSettings);
userRouter.post(
  '/:userId/settings',
  body('defaultTheme').isIn([Theme.DARK, Theme.LIGHT]),
  body('slackId').isString(),
  UsersController.updateUserSettings
);
userRouter.post('/change-role', intMinZero(body('userId')), isRole(body('role')), UsersController.updateUserRole);
userRouter.post('/auth/login', UsersController.logUserIn);
userRouter.post('/auth/login/dev', UsersController.logUserInDev);

export default userRouter;
