import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { MAX_FILE_SIZE } from 'shared';

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

export class InvalidOrganizationException extends HttpException {
  /**
   * Constructs an invalid organization error
   * @param item the name of the object that has an invalid organization
   */
  constructor(item: ExceptionObjectNames) {
    super(400, `${item} does not exist in current organization!`);
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

export class InvalidEventTypeConfigurationException extends HttpException {
  /**
   * Constructs an invalid event type configuration error
   * @param field the name of the required field that is missing
   */
  constructor(field: string) {
    super(400, `Event Type requires ${field}`);
  }
}

/*
 * Error handling middleware. Takes the error and sends back the status of it and the message
 */
export const errorHandler: ErrorRequestHandler = (error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const httpError = handleMulterError(error);
    res.status(httpError.status).json({ message: httpError.message });
    return;
  }

  if (error instanceof HttpException) {
    res.status(error.status).json({ message: error.message });
  } else {
    res.status(500).json({ message: JSON.stringify(error) });
    throw error;
  }
};

/**
 * Handles Multer-specific errors and converts them to appropriate HTTP responses
 * @param error - The Multer error object
 * @returns multer error as HttpException
 */
export const handleMulterError = (error: multer.MulterError): HttpException => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new HttpException(400, `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    case 'LIMIT_UNEXPECTED_FILE':
      return new HttpException(400, 'Unexpected field name for file upload');
    case 'LIMIT_FILE_COUNT':
      return new HttpException(400, 'Too many files uploaded');
    case 'LIMIT_PART_COUNT':
      return new HttpException(400, 'Too many parts in upload');
    case 'LIMIT_FIELD_KEY':
      return new HttpException(400, 'Field name too long');
    case 'LIMIT_FIELD_VALUE':
      return new HttpException(400, 'Field value too long');
    case 'LIMIT_FIELD_COUNT':
      return new HttpException(400, 'Too many fields');
    default:
      return new HttpException(400, `File upload error: ${error.message}`);
  }
};

// type so that the not found error messages are consistent
export type ExceptionObjectNames =
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
  | 'Account Code'
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
  | 'Link Type'
  | 'Team Type'
  | 'Work Package Template'
  | 'Description Bullet Type'
  | 'Organization'
  | 'Car'
  | 'Milestone'
  | 'Faq'
  | 'Checklist'
  | 'Checklist Item'
  | 'Pop Up'
  | 'Announcement'
  | 'Graph'
  | 'Graph Collection'
  | 'Project Template'
  | 'Part Review'
  | 'Part Submission'
  | 'Part'
  | 'Part Submission'
  | 'Part Tag'
  | 'Common Mistake'
  | 'Review Request'
  | 'File'
  | 'Graph Collection'
  | 'Sponsor'
  | 'SponsorTask'
  | 'Shop'
  | 'Machinery'
  | 'Sponsor Tier'
  | 'Index Code'
  | 'Reimbursement Product Other Reason'
  | 'Encryption Key'
  | 'Reimbursement Request Comment'
  | 'Calendar'
  | 'Event Type'
  | 'Event'
  | 'Schedule Slot'
  | 'Guest Definition';
