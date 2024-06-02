import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import { getOrganizationId } from '../utils/utils';
import OrganizationsService from '../services/organizations.service';

export default class OrganizationsController {
  static async setUsefulLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const { links } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      await OrganizationsService.setUsefulLinks(submitter, organizationId, links);
      res.status(200).json({ message: `Successfully set useful links for organization with id#: ${organizationId}` });
    } catch (error: unknown) {
      next(error);
    }
  }
}
