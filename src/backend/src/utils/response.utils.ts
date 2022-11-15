import { Response } from 'express';

export const sendErrorResponse = (res: Response, error: unknown) => {
  if (error instanceof Error) {
    res.status(error.cause as number).json({ message: error.message });
  } else {
    res.status(400).json({ message: 'Something went very wrong...' });
  }
};

export const sendSuccessJsonResponse = (res: Response, obj: any) => {
  res.status(200).json(obj);
};

export const sendSuccessMessageResponse = (res: Response, status: number, message: string) => {
  res.status(status).json({ message });
};

export const throwError = (status: number, message: string): never => {
  throw new Error(message, { cause: status });
};

type NotFoundObjectNames = 'User' | 'Risk' | 'Work Package' | 'Project' | 'Description Bullet';

export const throwNotFoundError = (name: NotFoundObjectNames, id: number | string): never => {
  return throwError(404, `${name} with id: ${id} not found!`);
};

export const throwAccessDeniedError = (message?: string) => {
  return throwError(403, 'Access Denied' + (message ? `: ${message}` : '!'));
};
