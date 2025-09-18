import { NextFunction, Request, Response } from 'express';

export default class RulesController {
  static async createRulesetType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, dateOfEvent } = req.body;

      const milestone = await RecruitmentServices.createMilestone(
        req.currentUser,
        name,
        description,
        dateOfEvent,
        req.organization
      );
      res.status(200).json(milestone);
    } catch (error: unknown) {
      next(error);
    }
  }
