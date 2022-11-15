import { Response } from 'express';

/**
 * Send a response with the given error
 * @param res the Express response object
 * @param error the error thrown by the service (really is never not instanceof Error)
 */
export const sendErrorResponse = (res: Response, error: unknown) => {
  if (error instanceof Error) {
    res.status(error.cause as number).json({ message: error.message });
  } else {
    res.status(400).json({ message: 'Something went very wrong...' });
  }
};

/**
 * Send a success json response
 * @param res the Express response object
 * @param obj any object we want to send back (e.g., User, Project, Risk[], number)
 */
export const sendSuccessJsonResponse = (res: Response, obj: any) => {
  res.status(200).json(obj);
};

/**
 * Send a success message response
 * @param res the Express response object
 * @param message the message we want to send back
 */
export const sendSuccessMessageResponse = (res: Response, message: string) => {
  res.status(200).json({ message });
};

/**
 * Throw an error with a status and message.
 * Note that TypeScript does not have a lot of ways to customize errors
 * so we're appropriating the "cause" property to be our status.
 * @param status the status code of the error (e.g., 400, 404, 403)
 * @param message the message to send with the error
 */
export const throwError = (status: number, message: string): never => {
  throw new Error(message, { cause: status });
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
