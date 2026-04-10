import { Event_Status, Graph_Display_Type, Graph_Type, Measure, Special_Permission } from '@prisma/client';
import { Request, Response } from 'express';
import { body, query, ValidationChain, validationResult } from 'express-validator';
import {
  MaterialStatus,
  TaskPriority,
  TaskStatus,
  WorkPackageStage,
  RoleEnum,
  WbsElementStatus,
  DayOfWeek,
  ConflictStatus
} from 'shared';

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

export const isGraphType = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn(Object.values(Graph_Type));
};

export const isMeasure = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn(Object.values(Measure));
};

export const isGraphDisplayType = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn(Object.values(Graph_Display_Type));
};

export const isSpecialPermission = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.isString().isIn(Object.values(Special_Permission));
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

export const isOptionalDate = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.optional().custom((value) => !isNaN(Date.parse(value)));
};

export const isDateOnly = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.custom((value) => {
    const parsed = Date.parse(value);
    if (isNaN(parsed)) return false;
    const date = new Date(parsed);
    return (
      date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0
    );
  });
};

export const isOptionalDateOnly = (validationObject: ValidationChain): ValidationChain => {
  return validationObject.optional().custom((value) => {
    const parsed = Date.parse(value);
    if (isNaN(parsed)) return false;
    const date = new Date(parsed);
    return (
      date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0
    );
  });
};

export const validateReimbursementProducts = () => {
  return [
    // Other products (non-project) - keep as strings
    body('otherReimbursementProducts').isArray(),
    nonEmptyString(body('otherReimbursementProducts.*.name')),
    nonEmptyString(body('otherReimbursementProducts.*.reason.otherProductReasonId')),
    nonEmptyString(body('otherReimbursementProducts.*.reason.name')),
    intMinZero(body('otherReimbursementProducts.*.cost')),

    // WBS products - now materials
    body('wbsReimbursementProducts').isArray(),
    nonEmptyString(body('wbsReimbursementProducts.*.materialId')),
    intMinZero(body('wbsReimbursementProducts.*.cost')),
    intMinZero(body('wbsReimbursementProducts.*.reason.carNumber')),
    intMinZero(body('wbsReimbursementProducts.*.reason.projectNumber')),
    intMinZero(body('wbsReimbursementProducts.*.reason.workPackageNumber'))
  ];
};

export const validateReimbursementProductsForEdit = (): ValidationChain[] => {
  return [
    // Other products (non-project) - keep as strings
    body('otherReimbursementProducts').isArray(),
    nonEmptyString(body('otherReimbursementProducts.*.name')),
    nonEmptyString(body('otherReimbursementProducts.*.reason.otherProductReasonId')),
    nonEmptyString(body('otherReimbursementProducts.*.reason.name')),
    intMinZero(body('otherReimbursementProducts.*.cost')),

    // WBS products
    body('wbsReimbursementProducts').isArray(),

    // Either materialId OR name must be present
    body('wbsReimbursementProducts.*.materialId').optional().isString(),
    body('wbsReimbursementProducts.*.name').optional().isString(),

    // Ensure at least one is provided
    body('wbsReimbursementProducts.*').custom((product) => {
      if (!product.materialId && !product.name) {
        throw new Error('Either materialId or name must be provided');
      }
      return true;
    }),

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
  isDateOnly(workPackageProposedChangesExists(body(`${base}.startDate`))),
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

export const isEventStatus = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isString()
    .isIn([Event_Status.CONFIRMED, Event_Status.DONE, Event_Status.SCHEDULED, Event_Status.UNCONFIRMED]);
};

export const isDayOfWeek = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isString()
    .isIn([
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY
    ]);
};

export const isConflictStatus = (validationObject: ValidationChain): ValidationChain => {
  return validationObject
    .isString()
    .isIn([ConflictStatus.APPROVED, ConflictStatus.PENDING, ConflictStatus.DENIED, ConflictStatus.NO_CONFLICT]);
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
  nonEmptyString(body('name')),
  nonEmptyString(body('summary')),
  ...descriptionBulletsValidators,
  ...linkValidators,
  nonEmptyString(body('leadId').optional()),
  nonEmptyString(body('managerId').optional())
];

export const materialValidators = [
  nonEmptyString(body('name')),
  nonEmptyString(body('assemblyId').optional()),
  isMaterialStatus(body('status')),
  nonEmptyString(body('materialTypeName')),
  body('manufacturerName').optional().isString(),
  body('manufacturerPartNumber').optional().isString(),
  body('pdmFileName').optional().isString(),
  decimalMinZero(body('quantity')).optional(),
  nonEmptyString(body('unitName')).optional(),
  intMinZero(body('price')).optional(), // in cents
  intMinZero(body('subtotal')).optional(), // in cents
  body('linkUrl').optional().isString(),
  body('notes').isString().optional()
];

export const validateInputs = (req: Request, res: Response, next: Function): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};

export const partTagValidators = [nonEmptyString(body('name')), nonEmptyString(body('colorHexCode'))];

export const partFaqValidators = [nonEmptyString(body('question')), nonEmptyString(body('answer'))];

export const partCommonMistakeValidators = [
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean()
];

export const partPopupValidators = [
  body('xCoord').isFloat(),
  body('yCoord').isFloat(),
  intMinZero(body('fileIndex')),
  nonEmptyString(body('title')),
  body('description').optional().isString()
];

export const financeDashboardFilterValidators = [
  nonEmptyString(query('startDate')).optional(),
  nonEmptyString(query('endDate')).optional()
];

export const requireFile = (chain: ValidationChain): ValidationChain => {
  return chain.custom((_value, { req }) => {
    if (!req.file) {
      throw new Error('Invalid or undefined document data');
    }
    return true;
  });
};
