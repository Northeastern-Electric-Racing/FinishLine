import { NextFunction, Request, Response } from 'express';
import StatisticsService from '../services/statistics.services';
import { Graph } from 'shared';
import prisma from '../prisma/prisma';

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
  static async createGraphCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const { title } = req.body;
      if (!req.currentUser || !req.organization) {
        res.status(400).json({ message: 'User or organization details are missing' });
      }

      const graphCollection = await StatisticsService.createGraphCollection(req.currentUser, title, req.organization);

      res.status(201).json(graphCollection);
    } catch (error) {
      next(error);
    }
  }
}
