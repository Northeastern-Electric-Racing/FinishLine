import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

export class Exception extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const errorHandler: ErrorRequestHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof Exception) {
    res.status(error.status).json({ message: error.message });
  } else {
    res.status(400).json({ message: 'Something went very wrong...' });
  }
};

/**
 * Throw an error with a status and message.
 * @param status the status code of the error (e.g., 400, 404, 403)
 * @param message the message to send with the error
 */
export const throwError = (status: number, message: string): never => {
  throw new Exception(status, message);
};

// type so that the not found error messages are consistent
type NotFoundObjectNames = 'User' | 'Risk' | 'Work Package' | 'Project' | 'Description Bullet';

/**
 * Throw a not found error response
 * @param name the name of the thing that can't be found
 * @param id the id of the thing that can't be found
 * @returns nothing, this is more for type checking stuff
 */
export const throwNotFoundError = (name: NotFoundObjectNames, id: number | string): never => {
  return throwError(404, `${name} with id: ${id} not found!`);
};

/**
 * Throw an access denied error
 * @param message the optional message to add to the 'Access Denied' message
 * @returns nothing, this is more for type checking stuff
 */
export const throwAccessDeniedError = (message?: string) => {
  return throwError(403, 'Access Denied' + (message ? `: ${message}` : '!'));
};
