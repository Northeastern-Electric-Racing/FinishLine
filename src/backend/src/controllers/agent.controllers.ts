import { NextFunction, Request, Response } from 'express';
import { getUserRole } from '../utils/users.utils.js';
import SlackServices from '../services/slack.services.js';

export default class AgentController {
  /**
   * Confirms an API token is valid and reports who it resolved to. This is deliberately verbose
   * about identity so a client can verify the whole token -> user -> organization -> role chain.
   */
  static async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentUser, organization } = req;
      const role = await getUserRole(currentUser.userId, organization.organizationId);

      res.status(200).json({
        status: 'healthy',
        user: {
          userId: currentUser.userId,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email
        },
        organization: {
          organizationId: organization.organizationId,
          name: organization.name
        },
        role
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async sendSlackMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { channelId, message } = req.body;
      const sentMessage = await SlackServices.sendMessageToChannel(
        req.currentUser.userId,
        req.organization,
        channelId,
        message
      );

      res.status(200).json(sentMessage);
    } catch (error: unknown) {
      next(error);
    }
  }
}
