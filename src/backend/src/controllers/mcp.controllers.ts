import { NextFunction, Request, Response } from 'express';
import { getRoleInOrganization } from '../utils/mcp-auth.utils.js';

export default class McpController {
  /**
   * Confirms an API token is valid and reports who it resolved to. This is deliberately verbose
   * about identity so a client can verify the whole token -> user -> organization -> role chain.
   */
  static async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentUser, organization } = req;
      const role = await getRoleInOrganization(currentUser.userId, organization.organizationId);

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
}
