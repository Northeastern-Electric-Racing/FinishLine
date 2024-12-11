import { NextFunction, Request, Response } from 'express';
import StatisticsService from '../services/statistics.services';
import { Graph } from 'shared';
import GraphService from '../services/statistics.services';

export default class StatisticsController {
  static async createGraph(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('in controller');
      const { startDate, endDate, title, graphType, measure, graphGen, graphCollectionId } = req.body;

      const graph: Graph = await StatisticsService.createGraph(
        req.currentUser,
        new Date(startDate),
        new Date(endDate),
        title,
        graphType,
        measure,
        graphGen,
        req.organization,
        graphCollectionId
      );

      res.status(200).json(graph);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const { graphId } = req.params;

      const requestedGraph = await GraphService.getSingleGraph(graphId, req.organization);

      res.status(200).json(requestedGraph);
    } catch (error: unknown) {
      next(error);
    }
  }
}
