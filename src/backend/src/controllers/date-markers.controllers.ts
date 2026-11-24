import { NextFunction, Request, Response } from 'express';
import DateMarkersService from '../services/date-markers.services.js';

export default class DateMarkersController {
  static async getAllDateMarkers(req: Request, res: Response, next: NextFunction) {
    try {
      const dateMarkers = await DateMarkersService.getAllDateMarkers(req.organization);
      res.status(200).json(dateMarkers);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createDateMarker(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, date } = req.body;

      await DateMarkersService.createDateMarker(req.currentUser, name, new Date(date), req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editDateMarker(req: Request, res: Response, next: NextFunction) {
    try {
      const { dateMarkerId } = req.params as Record<string, string>;
      const { name, date } = req.body;

      await DateMarkersService.editDateMarker(req.currentUser, dateMarkerId, name, new Date(date), req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteDateMarker(req: Request, res: Response, next: NextFunction) {
    try {
      const { dateMarkerId } = req.params as Record<string, string>;

      await DateMarkersService.deleteDateMarker(req.currentUser, dateMarkerId, req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }
}
