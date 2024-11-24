import { NextFunction, Request, Response } from 'express';
import StatisticsService from '../services/statistics.services';
import { Graph } from 'shared';

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

      return res.status(200).json(graph);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        currentUser: userEditing,
        startDate,
        endDate,
        title,
        graphType,
        measure,
        graphGen,
        organization,
        graphCollectionId
      } = req.body;
      const { graphId } = req.params;

      const updatedGraph = await StatisticsService.editGraph(
        userEditing,
        graphId,
        new Date(startDate),
        new Date(endDate),
        title,
        graphType,
        measure,
        graphGen,
        organization,
        graphCollectionId
      );

      return res.status(200).json(updatedGraph);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
