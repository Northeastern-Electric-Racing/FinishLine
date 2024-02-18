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

export class DeletedException extends HttpException {
  /**
   * Constructs a deleted error
   * @param name the name of the thing that is deleted
   * @param id the id of the thing that is deleted
   */
  constructor(name: ExceptionObjectNames, id: number | string) {
    super(404, `${name} with id: ${id} has been deleted already!`);
  }
}

export class NotFoundException extends HttpException {
  /**
   * Constructs a not found error
   * @param name the name of the thing that can't be found
   * @param id the id of the thing that can't be found
   */
  constructor(name: ExceptionObjectNames, id: number | string) {
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

export class AccessDeniedAdminOnlyException extends AccessDeniedException {
  /**
   * Constructs an access denied error that non-admins may receive.
   * @param message the action that is disallowed.
   */
  constructor(message: string) {
    super(`admin and app-admin only have the ability to ${message}`);
  }
}

export class AccessDeniedMemberException extends AccessDeniedException {
  /**
   * Constructs an access denied error that guests and members may receive.
   * @param message the action that is disallowed.
   */
  constructor(message: string) {
    super(`members and guests do not have the ability to ${message}`);
  }
}

export class AccessDeniedGuestException extends AccessDeniedException {
  /**
   * Constructs an access denied error that guests may receive.
   * @param message the action that is disallowed.
   */
  constructor(message: string) {
    super(`guests do not have the ability to ${message}`);
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
    res.status(500).json({ message: JSON.stringify(error) });
    throw error;
  }
};

// type so that the not found error messages are consistent
type ExceptionObjectNames =
  | 'User'
  | 'Work Package'
  | 'Project'
  | 'Description Bullet'
  | 'Change Request'
  | 'WBS Element'
  | 'Proposed Solution'
  | 'Team'
  | 'User Settings'
  | 'Task'
  | 'Vendor'
  | 'Expense Type'
  | 'Reimbursement Request'
  | 'Reimbursement'
  | 'User Secure Settings'
  | 'Material'
  | 'Image File'
  | 'Material'
  | 'Assembly'
  | 'Material Type'
  | 'Manufacturer'
  | 'Unit'
  | 'Material'
  | 'Link Type';
