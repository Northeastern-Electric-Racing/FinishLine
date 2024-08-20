import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import UsersService from '../services/users.services';
import { AccessDeniedException } from '../utils/errors.utils';

export default class UsersController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UsersService.getAllUsers(req.organization.organizationId);

      return res.status(200).json(users);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getSingleUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const requestedUser = await UsersService.getSingleUser(userId, req.organization);

      return res.status(200).json(requestedUser);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getUserSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await UsersService.getUserSettings(req.currentUser.userId);

      return res.status(200).json(settings);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getCurrentUserSecureSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const secureSettings = await UsersService.getCurrentUserSecureSettings(req.currentUser);

      return res.status(200).json(secureSettings);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getUsersFavoriteProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await UsersService.getUsersFavoriteProjects(req.currentUser.userId, req.organization);

      return res.status(200).json(projects);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async updateUserSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { defaultTheme, slackId } = req.body;
      const user = req.currentUser;

      await UsersService.updateUserSettings(user, defaultTheme, slackId);

      return res.status(200).json({ message: `Successfully updated settings for user ${user.userId}.` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async logUserIn(req: Request, res: Response, next: NextFunction) {
    try {
      const idToken = req.body.id_token;
      const header = req.headers['user-agent'];

      const { user, token } = await UsersService.logUserIn(idToken, header!);

      res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
      return res.status(200).json(user);
    } catch (error: unknown) {
      return next(error);
    }
  }

  // for dev login only!
  static async logUserInDev(req: Request, res: Response, next: NextFunction) {
    try {
      if (process.env.NODE_ENV === 'production') throw new AccessDeniedException('Cant dev login on production!');

      const { userId } = req.body;
      const header = req.headers['user-agent'];

      if (!header) {
        throw new AccessDeniedException('You cannot put an unknown for dev login!');
      }

      const user = await UsersService.logUserInDev(userId, header);

      return res.status(200).json(user);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const targetUser = await UsersService.updateUserRole(userId, req.currentUser, role, req.organization);

      return res.status(200).json(targetUser);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getUserSecureSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const userSecureSettings = await UsersService.getUserSecureSetting(userId, req.currentUser, req.organization);

      return res.status(200).json(userSecureSettings);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setUserSecureSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { nuid, street, city, state, zipcode, phoneNumber } = req.body;
      const user = req.currentUser;

      await UsersService.setUserSecureSettings(user, nuid, street, city, state, zipcode, phoneNumber);

      return res.status(200).json({ message: `Successfully updated secure settings for user ${user.userId}.` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setUserScheduleSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { personalGmail, personalZoomLink, availability } = req.body;

      const updatedScheduleSettings = await UsersService.setUserScheduleSettings(
        req.currentUser,
        personalGmail,
        personalZoomLink,
        availability
      );

      return res.status(200).json(updatedScheduleSettings);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getUserScheduleSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const userScheduleSettings = await UsersService.getUserScheduleSettings(userId, req.currentUser);
      return res.status(200).json(userScheduleSettings);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
