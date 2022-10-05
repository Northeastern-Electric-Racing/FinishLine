import { ValidationChain } from 'express-validator';

export const intMinZero = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isInt({ min: 0 }).not().isString();
};

//Const to return if an input is a string and is not empty
export const nonEmptyString = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().not().isEmpty();
};
