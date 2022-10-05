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
  body('defaultTheme').isBoolean().not().isEmpty(),
  body('slackId').isString().not().isEmpty().optional({ nullable: true }),
  updateUserSettings
);
userRouter.post('/auth/:login', logUserIn);

export default userRouter;
