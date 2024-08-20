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

      const newLinks = await OrganizationsService.setUsefulLinks(submitter, organizationId, links);
      res.status(200).json(newLinks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { applyInterestImage = [], exploreAsGuestImage = [] } = req.files as {
        applyInterestImage?: Express.Multer.File[];
        exploreAsGuestImage?: Express.Multer.File[];
      };

      const applyInterestFile = applyInterestImage[0] || null;
      const exploreAsGuestFile = exploreAsGuestImage[0] || null;

      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const newImages = await OrganizationsService.setImages(
        applyInterestFile,
        exploreAsGuestFile,
        submitter,
        organizationId
      );

      res.status(200).json(newImages);
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

  static async getOrganizationImages(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);
      const images = await OrganizationsService.getOrganizationImages(organizationId);
      res.status(200).json(images);
    } catch (error: unknown) {
      next(error);
    }
  }
}
