import { NextFunction, Request, Response } from 'express';
import OrganizationsService from '../services/organizations.services';
import { HttpException } from '../utils/errors.utils';

export default class OrganizationsController {
  static async setUsefulLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const { links } = req.body;
      const newLinks = await OrganizationsService.setUsefulLinks(req.currentUser, req.organization.organizationId, links);
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
      const links = await OrganizationsService.getAllUsefulLinks(req.organization.organizationId);
      return res.status(200).json(links);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getOrganizationImages(req: Request, res: Response, next: NextFunction) {
    try {
      const images = await OrganizationsService.getOrganizationImages(req.organization.organizationId);
      res.status(200).json(images);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setLogoImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpException(400, 'Invalid or undefined image data');
      }
      const updatedOrg = await OrganizationsService.setLogoImage(req.file, req.currentUser, req.organization);

      return res.status(200).json(updatedOrg);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getOrganizationLogoImage(req: Request, res: Response, next: NextFunction) {
    try {
      const logoImageId = await OrganizationsService.getLogoImage(req.organization.organizationId);
      res.status(200).json(logoImageId);
    } catch (error: unknown) {
      next(error);
    }
  }
}
