import { NextFunction, Request, Response } from 'express';
import OrganizationsService from '../services/organizations.service';

export default class OrganizationsController {
  static async setUsefulLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const { links } = req.body;
      const newLinks = await OrganizationsService.setUsefulLinks(req.currentUser, req.organization, links);
      return res.status(200).json(newLinks);
    } catch (error: unknown) {
      return next(error);
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

      const newImages = await OrganizationsService.setImages(
        applyInterestFile,
        exploreAsGuestFile,
        req.currentUser,
        req.organization
      );

      return res.status(200).json(newImages);
    } catch (error: unknown) {
      return next(error);
    }
  }
  static async getAllUsefulLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const links = await OrganizationsService.getAllUsefulLinks(req.organization);
      return res.status(200).json(links);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
