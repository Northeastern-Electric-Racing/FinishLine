import { NextFunction, Request, Response } from 'express';
import GraphService from '../services/graph.services';

export default class GraphController {
  static async getSingleGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const { graphDataId } = req.params;

      const requestedUser = await GraphService.getSingleGraph(graphDataId, req.organization);

      return res.status(200).json(requestedUser);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
