import { Design_Review_Status } from '@prisma/client';
import { Request, Response } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
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
  return validationObject.if((_value: any, { req }: any) => req.body.projectProposedChanges);
};

const workPackageProposedChangesExists = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.if((_value: any, { req }: any) => req.body.workPackageProposedChanges);
};

export const workPackageProposedChangesValidators = (base: string) => [
  body(base).optional(),
  nonEmptyString(workPackageProposedChangesExists(body(`${base}.name`))),
  nonEmptyString(body(`${base}.leadId`).optional()),
  nonEmptyString(body(`${base}.managerId`).optional()),
  isWorkPackageStageOrNone(workPackageProposedChangesExists(body(`${base}.stage`).optional())),
  isDate(workPackageProposedChangesExists(body(`${base}.startDate`))),
  intMinZero(workPackageProposedChangesExists(body(`${base}.duration`))),
  workPackageProposedChangesExists(body(`${base}.blockedBy`)).isArray(),
  intMinZero(body(`${base}.blockedBy.*.carNumber`)),
  intMinZero(body(`${base}.blockedBy.*.projectNumber`)),
  intMinZero(body(`${base}.blockedBy.*.workPackageNumber`))
];

export const projectProposedChangesValidators = [
  body('projectProposedChanges').optional(),
  nonEmptyString(projectProposedChangesExists(body('projectProposedChanges.name'))),
  projectProposedChangesExists(body('projectProposedChanges.links')).isArray(),
  nonEmptyString(body('projectProposedChanges.links.*.url')),
  nonEmptyString(body('projectProposedChanges.links.*.linkTypeName')),
  nonEmptyString(body('projectProposedChanges.leadId').optional()),
  nonEmptyString(body('projectProposedChanges.managerId').optional()),
  nonEmptyString(projectProposedChangesExists(body('projectProposedChanges.summary'))),
  intMinZero(projectProposedChangesExists(body('projectProposedChanges.budget'))),
  projectProposedChangesExists(body('projectProposedChanges.teamIds')).isArray(),
  nonEmptyString(body('projectProposedChanges.teamIds.*')),
  projectProposedChangesExists(body('projectProposedChanges.carNumber')).optional().isInt(),
  projectProposedChangesExists(body('projectProposedChanges.workPackageProposedChanges')).isArray(),
  ...workPackageProposedChangesValidators('projectProposedChanges.workPackageProposedChanges.*')
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

export const descriptionBulletsValidators = [
  body('descriptionBullets').isArray(),
  nonEmptyString(body('descriptionBullets.*.detail')),
  nonEmptyString(body('descriptionBullets.*.type')),
  nonEmptyString(body('descriptionBullets.*.id'))
];

export const blockedByValidators = [
  body('blockedBy').isArray(),
  intMinZero(body('blockedBy.*.carNumber')),
  intMinZero(body('blockedBy.*.projectNumber')),
  intMinZero(body('blockedBy.*.workPackageNumber'))
];

export const linkValidators = [
  body('links').isArray(),
  nonEmptyString(body('links.*.url')),
  nonEmptyString(body('links.*.linkTypeName'))
];

export const projectValidators = [
  nonEmptyString(body('crId')),
  nonEmptyString(body('name')),
  nonEmptyString(body('summary')),
  ...descriptionBulletsValidators,
  ...linkValidators,
  nonEmptyString(body('leadId').optional()),
  nonEmptyString(body('managerId').optional())
];

export const validateInputs = (req: Request, res: Response, next: Function): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
