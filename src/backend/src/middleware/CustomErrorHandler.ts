import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { CustomException } from '../exceptions/CustomException';

export const customerErrorHandler: ErrorRequestHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof CustomException) {
    return res.status(err.status).send(err.message);
  }

  return res.sendStatus(500);
};
