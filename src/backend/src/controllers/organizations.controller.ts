import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import { getOrganizationId } from '../utils/utils';
import OrganizationsService from '../services/organizations.services';

export default class OrganizationsController {
  static async setUsefulLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const { links } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const newLinks = await OrganizationsService.setUsefulLinks(submitter, organizationId, links);
      res.status(200).json(newLinks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllUsefulLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);

      const links = await OrganizationsService.getAllUsefulLinks(organizationId);
      res.status(200).json(links);
    } catch (error: unknown) {
      next(error);
    }
  }
}
