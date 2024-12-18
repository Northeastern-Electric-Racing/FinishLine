import { NextFunction, Request, Response } from 'express';
import StatisticsService from '../services/statistics.services';
import { Graph } from 'shared';

export default class StatisticsController {
  static async createGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        startDate,
        endDate,
        title,
        graphType,
        graphDisplayType,
        measure,
        carIds,
        graphCollectionId,
        specialPermissions
      } = req.body;

      const graph: Graph = await StatisticsService.createGraph(
        req.currentUser,
        title,
        graphType,
        measure,
        graphDisplayType,
        req.organization,
        carIds,
        specialPermissions,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        graphCollectionId
      );

      res.status(200).json(graph);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const requestedGraph = await StatisticsService.getSingleGraph(id, req.currentUser, req.organization);

      res.status(200).json(requestedGraph);
    } catch (error: unknown) {
      next(error);
    }
  }
}
