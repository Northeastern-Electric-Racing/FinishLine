

export const intMinZero = (validationObject: any): boolean => {
   return validationObject.isInt({min: 0}).not().isString()
}
