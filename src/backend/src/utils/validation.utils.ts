

export const intMinZero = (validationObject: any): any => {
  return validationObject.isInt({ min: 0 }).not().isString();
};
