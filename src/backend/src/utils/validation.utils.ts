import { ValidationChain } from 'express-validator';
import { ClubAccount, MaterialStatus } from 'shared';
import { TaskPriority, TaskStatus, WorkPackageStage, RoleEnum } from 'shared';

export const intMinZero = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isInt({ min: 0 }).not().isString();
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
      'NONE'
    ]);
};

export const isAccount = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn([ClubAccount.BUDGET, ClubAccount.CASH]);
};

export const isMaterialStatus = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isString()
    .isIn([MaterialStatus.Ordered, MaterialStatus.Received, MaterialStatus.Unordered, MaterialStatus.Shipped]);
};
