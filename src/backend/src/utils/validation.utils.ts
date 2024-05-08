import { Design_Review_Status } from '@prisma/client';
import { body, ValidationChain } from 'express-validator';
import { ClubAccount, MaterialStatus, TaskPriority, TaskStatus, WorkPackageStage, RoleEnum, WbsElementStatus } from 'shared';

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

export const isStatus = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn([WbsElementStatus.Inactive, WbsElementStatus.Active, WbsElementStatus.Complete]);
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

export const isWorkPackageStage = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isString()
    .isIn([
      WorkPackageStage.Research,
      WorkPackageStage.Design,
      WorkPackageStage.Manufacturing,
      WorkPackageStage.Install,
      WorkPackageStage.Testing
    ]);
};

export const isDate = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.custom((value) => !isNaN(Date.parse(value)));
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

const projectProposedChangesExists = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.if((value: any, { req }: any) => req.body.projectProposedChanges);
};

export const projectProposedChangesValidators = [
  body('projectProposedChanges').optional(),
  nonEmptyString(projectProposedChangesExists(body('projectProposedChanges.name'))),
  projectProposedChangesExists(body('projectProposedChanges.links')).isArray(),
  nonEmptyString(body('projectProposedChanges.links.*.url')),
  nonEmptyString(body('projectProposedChanges.links.*.linkTypeName')),
  intMinZero(body('projectProposedChanges.projectLeadId').optional()),
  intMinZero(body('projectProposedChanges.projectManagerId').optional()),
  nonEmptyString(projectProposedChangesExists(body('projectProposedChanges.summary'))),
  intMinZero(projectProposedChangesExists(body('projectProposedChanges.budget'))),
  projectProposedChangesExists(body('projectProposedChanges.rules')).isArray(),
  nonEmptyString(projectProposedChangesExists(body('projectProposedChanges.rules.*'))),
  projectProposedChangesExists(body('projectProposedChanges.goals')).isArray(),
  nonEmptyString(body('projectProposedChanges.goals.*')),
  projectProposedChangesExists(body('projectProposedChanges.features')).isArray(),
  nonEmptyString(body('projectProposedChanges.features.*')),
  projectProposedChangesExists(body('projectProposedChanges.otherConstraints')).isArray(),
  nonEmptyString(body('projectProposedChanges.otherConstraints.*')),
  projectProposedChangesExists(body('projectProposedChanges.teamIds')).isArray(),
  nonEmptyString(body('projectProposedChanges.teamIds.*')),
  projectProposedChangesExists(body('projectProposedChanges.carNumber')).optional().isInt()
];

const workPackageProposedChangesExists = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.if((value: any, { req }: any) => req.body.workPackageProposedChanges);
};

export const workPackageProposedChangesValidators = [
  body('workPackageProposedChanges').optional(),
  nonEmptyString(workPackageProposedChangesExists(body('workPackageProposedChanges.name'))),
  intMinZero(body('workPackageProposedChanges.projectLeadId').optional()),
  intMinZero(body('workPackageProposedChanges.projectManagerId').optional()),
  isWorkPackageStageOrNone(workPackageProposedChangesExists(body('workPackageProposedChanges.stage').optional())),
  isDate(workPackageProposedChangesExists(body('workPackageProposedChanges.startDate'))),
  intMinZero(workPackageProposedChangesExists(body('workPackageProposedChanges.duration'))),
  workPackageProposedChangesExists(body('workPackageProposedChanges.blockedBy')).isArray(),
  intMinZero(body('workPackageProposedChanges.blockedBy.*.carNumber')),
  intMinZero(body('workPackageProposedChanges.blockedBy.*.projectNumber')),
  intMinZero(body('workPackageProposedChanges.blockedBy.*.workPackageNumber')),
  workPackageProposedChangesExists(body('workPackageProposedChanges.expectedActivities')).isArray(),
  nonEmptyString(body('workPackageProposedChanges.expectedActivities.*')),
  workPackageProposedChangesExists(body('workPackageProposedChanges.deliverables')).isArray(),
  nonEmptyString(body('workPackageProposedChanges.deliverables.*'))
];

export const isTaskPriority = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn([TaskPriority.High, TaskPriority.Medium, TaskPriority.Low]);
};

export const isTaskStatus = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn([TaskStatus.DONE, TaskStatus.IN_BACKLOG, TaskStatus.IN_PROGRESS]);
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
