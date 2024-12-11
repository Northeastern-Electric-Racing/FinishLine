import { NextFunction, Request, Response } from 'express';
import UsersService from '../services/users.services';
import { AccessDeniedException } from '../utils/errors.utils';
import { Task } from 'shared';

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
      const { userId } = req.params;

      const requestedUser = await UsersService.getSingleUser(userId, req.organization);

      res.status(200).json(requestedUser);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUserSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await UsersService.getUserSettings(req.currentUser.userId);

      res.status(200).json(settings);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getCurrentUserSecureSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const secureSettings = await UsersService.getCurrentUserSecureSettings(req.currentUser);

      res.status(200).json(secureSettings);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUsersFavoriteProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await UsersService.getUsersFavoriteProjects(req.currentUser.userId, req.organization);

      res.status(200).json(projects);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateUserSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { defaultTheme, slackId } = req.body;
      const user = req.currentUser;

      await UsersService.updateUserSettings(user, defaultTheme, slackId);

      res.status(200).json({ message: `Successfully updated settings for user ${user.userId}.` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async logUserIn(req: Request, res: Response, next: NextFunction) {
    try {
      const idToken = req.body.id_token;
      const header = req.headers['user-agent'];

      const { user, token } = await UsersService.logUserIn(idToken, header!);

      res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
      res.status(200).json(user);
    } catch (error: unknown) {
      next(error);
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

      res.status(200).json(user);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const targetUser = await UsersService.updateUserRole(userId, req.currentUser, role, req.organization);

      res.status(200).json(targetUser);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUserSecureSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const userSecureSettings = await UsersService.getUserSecureSetting(userId, req.currentUser, req.organization);

      res.status(200).json(userSecureSettings);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setUserSecureSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { nuid, street, city, state, zipcode, phoneNumber } = req.body;
      const user = req.currentUser;

      await UsersService.setUserSecureSettings(user, nuid, street, city, state, zipcode, phoneNumber);

      res.status(200).json({ message: `Successfully updated secure settings for user ${user.userId}.` });
    } catch (error: unknown) {
      next(error);
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

      res.status(200).json(updatedScheduleSettings);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUserScheduleSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const userScheduleSettings = await UsersService.getUserScheduleSettings(userId, req.currentUser);
      res.status(200).json(userScheduleSettings);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUserTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { organization } = req;

      const userTasks = await UsersService.getUserTasks(userId, organization);
      res.status(200).json(userTasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getManyUserTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;

      const tasks: Task[] = await UsersService.getManyUserTasks(userIds, req.organization);
      res.status(200).json(tasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async sendNotificationToUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, iconName, userIds } = req.body;

      const createdNotification = await UsersService.sendNotifcationToUsers(text, iconName, userIds, req.organization);
      res.status(200).json(createdNotification);
    } catch (error: unknown) {
      next(error);
    }
  }
}
