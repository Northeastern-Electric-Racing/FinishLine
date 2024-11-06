import { NextFunction, Request, Response } from 'express';
import StatisticsService from '../services/statistics.services';
import { Graph } from 'shared';

export default class StatisticsController {
  static async createGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, title, graphType, data, groupBy, graphCollectionLinkId } = req.body;

      const graph: Graph = await StatisticsService.createGraph(
        req.currentUser,
        startDate,
        endDate,
        title,
        graphType,
        data,
        groupBy,
        graphCollectionLinkId,
        req.organization
      );

      return res.status(200).json(graph);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
