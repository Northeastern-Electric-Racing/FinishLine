import { ValidationChain } from 'express-validator';
import { Club_Account } from 'shared';

export const intMinZero = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isInt({ min: 0 }).not().isString();
};

//Const to return if an input is a string and is not empty
export const nonEmptyString = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().not().isEmpty();
};

export const isRole = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn(['APP_ADMIN', 'ADMIN', 'HEAD', 'LEADERSHIP', 'MEMBER', 'GUEST']);
};

export const isDate = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.custom((value) => !isNaN(Date.parse(value)));
};

export const isTaskPriority = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn(['LOW', 'MEDIUM', 'HIGH']);
};

export const isTaskStatus = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn(['IN_BACKLOG', 'IN_PROGRESS', 'DONE']);
};

export const isWorkPackageStageOrNone = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn(['RESEARCH', 'DESIGN', 'MANUFACTURING', 'INTEGRATION', 'NONE']);
};

export const isAccount = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn([Club_Account.BUDGET, Club_Account.CASH]);
};
