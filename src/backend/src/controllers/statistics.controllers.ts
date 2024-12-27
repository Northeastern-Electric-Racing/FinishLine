import { NextFunction, Request, Response } from 'express';
import StatisticsService from '../services/statistics.services';
import { Graph, GraphCollection } from 'shared';

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

  static async getAllGraphCollections(req: Request, res: Response, next: NextFunction) {
    try {
      const graphCollections = await StatisticsService.getAllGraphCollections(req.currentUser, req.organization);
      res.status(200).json(graphCollections);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        startDate,
        endDate,
        title,
        graphType,
        measure,
        graphDisplayType,
        graphCollectionId,
        carIds,
        specialPermissions
      } = req.body;
      const { graphId } = req.params;

      const updatedGraph = await StatisticsService.editGraph(
        req.currentUser,
        graphId,
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

      res.status(200).json(updatedGraph);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createGraphCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, specialPermissions } = req.body;
      const graphCollection: GraphCollection = await StatisticsService.createGraphCollection(
        req.currentUser,
        title,
        specialPermissions,
        req.organization
      );
      res.status(200).json(graphCollection);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editGraphCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, specialPermissions } = req.body;
      const { graphCollectionId } = req.params;
      const graphCollection: GraphCollection = await StatisticsService.editGraphCollection(
        req.currentUser,
        graphCollectionId,
        title,
        specialPermissions,
        req.organization
      );
      res.status(200).json(graphCollection);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleGraphCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const { graphCollectionId } = req.params;
      const graphCollection: GraphCollection = await StatisticsService.getSingleGraphCollection(
        req.currentUser,
        graphCollectionId,
        req.organization
      );
      res.status(200).json(graphCollection);
    } catch (error: unknown) {
      next(error);
    }
  }
}
