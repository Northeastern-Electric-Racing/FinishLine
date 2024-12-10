import { NextFunction, Request, Response } from 'express';
import GraphService from '../services/graph.services';

export default class GraphController {
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
