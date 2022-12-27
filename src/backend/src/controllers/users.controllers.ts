import { NextFunction, Request, Response } from 'express';
import { generateAccessToken } from '../utils/utils';
import UsersService from '../services/users.services';
import { AccessDeniedException } from '../utils/errors.utils';

export default class UsersController {
  static async getAllUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UsersService.getAllUsers();

      res.status(200).json(users);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: number = parseInt(req.params.userId);
      const requestedUser = await UsersService.getSingleUser(userId);

      res.status(200).json(requestedUser);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUserSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: number = parseInt(req.params.userId);
      const settings = await UsersService.getUserSettings(userId);

      res.status(200).json(settings);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateUserSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { defaultTheme, slackId } = req.body;
      const userId = parseInt(req.params.userId);

      const settings = await UsersService.updateUserSettings(userId, defaultTheme, slackId);

      res.status(200).json({ message: `Successfully updated settings for user ${userId}.` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async logUserIn(req: Request, res: Response, next: NextFunction) {
    try {
      const idToken = req.body.id_token;
      const header = req.headers['user-agent'];

      const user = await UsersService.logUserIn(idToken, header!);

      const token = generateAccessToken({ userId: user.userId, firstName: user.firstName, lastName: user.lastName });
      res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
      res.status(200).json(user);
    } catch (error: unknown) {
      next(error);
    }
  }

  // for dev login only!
  static async logUserInDev(req: any, res: any, next: NextFunction) {
    if (process.env.NODE_ENV === 'production') throw new AccessDeniedException('Cant dev login on production!');

    try {
      const { userId } = req.body;
      const header = req.headers['user-agent'];

      const user = await UsersService.logUserInDev(userId, header);

      res.status(200).json(user);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId: number = parseInt(req.params.userId);
      const { role, userId } = req.body;

      const targetUser = await UsersService.updateUserRole(targetUserId, userId, role);

      res.status(200).json(targetUser);
    } catch (error: unknown) {
      next(error);
    }
  }
}
