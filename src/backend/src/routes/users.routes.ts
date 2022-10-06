import { Theme } from '@prisma/client';
import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getSingleUser,
  getUserSettings,
  logUserIn,
  updateUserSettings
} from '../controllers/users.controllers';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:userId', getSingleUser);
userRouter.get('/:userId/settings', getUserSettings);
userRouter.post(
  '/:userId/settings',
  body('defaultTheme').isIn([Theme.DARK, Theme.LIGHT]),
  body('slackId').isString().notEmpty().optional({ nullable: true }),
  updateUserSettings
);
userRouter.post('/auth/:login', logUserIn);

export default userRouter;
