import { NextFunction, Request, Response } from 'express';
import OnboardingServices from '../services/onboarding.services';

export default class OnboardingController {
  static async downloadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;

      const imageData = await OnboardingServices.downloadImage(fileId);

      // Set the appropriate headers for the HTTP response
      res.setHeader('content-type', String(imageData.type));
      res.setHeader('content-length', imageData.buffer.length);

      // Send the Buffer as the response body
      res.send(imageData.buffer);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
