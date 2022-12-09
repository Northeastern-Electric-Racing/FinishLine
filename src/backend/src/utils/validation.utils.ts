import { ValidationChain } from 'express-validator';

export const intMinZero = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isInt({ min: 0 }).not().isString();
};

//Const to return if an input is a string and is not empty
export const nonEmptyString = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().not().isEmpty();
};

export const isRole = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn(['APP_ADMIN', 'ADMIN', 'LEADERSHIP', 'MEMBER', 'GUEST']);
};

export const isDate = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.custom((value) => !isNaN(Date.parse(value)));
};
