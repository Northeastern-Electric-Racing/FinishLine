import { ValidationChain } from 'express-validator';

export const intMinZero = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isInt({ min: 0 }).not().isString();
};

export const nonEmptyString = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().not().isEmpty();
};
