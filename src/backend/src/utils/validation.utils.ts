import { Design_Review_Status } from '@prisma/client';
import { body, ValidationChain } from 'express-validator';
import { ClubAccount, MaterialStatus } from 'shared';
import { TaskPriority, TaskStatus, WorkPackageStage, RoleEnum } from 'shared';

export const intMinZero = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isInt({ min: 0 }).not().isString();
};

export const decimalMinZero = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isDecimal()
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Value must be greater than or equal to zero');
};

//Const to return if an input is a string and is not empty
export const nonEmptyString = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().not().isEmpty();
};

export const isRole = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isString()
    .isIn([RoleEnum.APP_ADMIN, RoleEnum.ADMIN, RoleEnum.HEAD, RoleEnum.LEADERSHIP, RoleEnum.MEMBER, RoleEnum.GUEST]);
};

export const validateReimbursementProducts = () => {
  return [
    body('otherReimbursementProducts').isArray(),
    nonEmptyString(body('otherReimbursementProducts.*.name')),
    intMinZero(body('otherReimbursementProducts.*.cost')),
    nonEmptyString(body('otherReimbursementProducts.*.reason')),
    body('wbsReimbursementProducts').isArray(),
    nonEmptyString(body('wbsReimbursementProducts.*.name')),
    intMinZero(body('wbsReimbursementProducts.*.cost')),
    intMinZero(body('wbsReimbursementProducts.*.reason.carNumber')),
    intMinZero(body('wbsReimbursementProducts.*.reason.projectNumber')),
    intMinZero(body('wbsReimbursementProducts.*.reason.workPackageNumber'))
  ];
};

export const isDate = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.custom((value) => !isNaN(Date.parse(value)));
};

export const isTaskPriority = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn([TaskPriority.High, TaskPriority.Medium, TaskPriority.Low]);
};

export const isTaskStatus = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn([TaskStatus.DONE, TaskStatus.IN_BACKLOG, TaskStatus.IN_PROGRESS]);
};

export const isWorkPackageStageOrNone = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isString()
    .isIn([
      WorkPackageStage.Research,
      WorkPackageStage.Design,
      WorkPackageStage.Manufacturing,
      WorkPackageStage.Install,
      WorkPackageStage.Testing,
      'NONE'
    ]);
};

export const isAccount = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn([ClubAccount.BUDGET, ClubAccount.CASH]);
};

export const isMaterialStatus = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isString()
    .isIn([
      MaterialStatus.Ordered,
      MaterialStatus.Received,
      MaterialStatus.NotReadyToOrder,
      MaterialStatus.ReadyToOrder,
      MaterialStatus.Shipped
    ]);
};

export const isDesignReviewStatus = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isString()
    .isIn([
      Design_Review_Status.CONFIRMED,
      Design_Review_Status.DONE,
      Design_Review_Status.SCHEDULED,
      Design_Review_Status.UNCONFIRMED
    ]);
};
