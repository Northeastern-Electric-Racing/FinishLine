import express from 'express';
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
userRouter.post('/:userId/settings', updateUserSettings);
userRouter.post('/auth/:login', logUserIn);

export default userRouter;
