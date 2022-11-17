import { Response } from 'express';

/**
 * Send a success json response
 * @param res - the Express response object
 * @param status - the status to send
 * @param obj - any object we want to send back (e.g., User, Project, Risk[], number)
 */
export const sendSuccessJsonResponse = (res: Response, status: number, obj: any) => {
  res.status(200).json(obj);
};

/**
 * Send a success message response
 * @param res - the Express response object
 * @param status - the status to send
 * @param message - the message we want to send back
 */
export const sendSuccessMessageResponse = (res: Response, status: number, message: string) => {
  res.status(status).json({ message });
};
