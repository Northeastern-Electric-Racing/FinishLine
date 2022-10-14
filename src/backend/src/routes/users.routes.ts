import { Theme } from '@prisma/client';
import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getSingleUser,
  getUserSettings,
  logUserIn,
  logUserInDev,
  updateUserSettings,
  updateUserRole
} from '../controllers/users.controllers';
import { intMinZero, isRole } from '../utils/validation.utils';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:userId', getSingleUser);
userRouter.get('/:userId/settings', getUserSettings);
userRouter.post(
  '/:userId/settings',
  body('defaultTheme').isIn([Theme.DARK, Theme.LIGHT]),
  body('slackId').isString(),
  updateUserSettings
);
userRouter.post(
  '/:userId/change-role',
  intMinZero(body('userId')),
  isRole(body('role')),
  updateUserRole
);
userRouter.post('/auth/login', logUserIn);
userRouter.post('/auth/login/dev', logUserInDev);

export default userRouter;
