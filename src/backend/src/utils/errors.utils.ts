import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

/**
 * Custom Error type that has a status code and a message (from the default Error class)
 */
export class HttpException extends Error {
  public status: number;

  /**
   * Constructs an error with a status and message.
   * @param status the status code of the error (e.g., 400, 404, 403)
   * @param message the message to send with the error
   */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class NotFoundException extends HttpException {
  /**
   * Constructs a not found error
   * @param name the name of the thing that can't be found
   * @param id the id of the thing that can't be found
   */
  constructor(name: NotFoundObjectNames, id: number | string) {
    super(404, `${name} with id: ${id} not found!`);
  }
}

export class AccessDeniedException extends HttpException {
  /**
   * Constructs an access denied error
   * @param message the optional message to add to the 'Access Denied' message
   */
  constructor(message?: string) {
    super(403, 'Access Denied' + (message ? `: ${message}` : '!'));
  }
}

/*
 * Error handling middleware. Takes the error and sends back the status of it and the message
 */
export const errorHandler: ErrorRequestHandler = (error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof HttpException) {
    res.status(error.status).json({ message: error.message });
  } else {
    res.status(500).json({ message: 'Something went very wrong...' });
  }
};

// type so that the not found error messages are consistent
type NotFoundObjectNames =
  | 'User'
  | 'Risk'
  | 'Work Package'
  | 'Project'
  | 'Description Bullet'
  | 'Change Request'
  | 'WBS Element' 
  | 'Proposed Solution';
