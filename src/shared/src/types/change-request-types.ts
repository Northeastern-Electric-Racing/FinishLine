/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, UserPreview } from './user-types.js';
import {
  AccountCode,
  AccountCodePreview,
  AccountCodeSummary,
  OtherProductReason,
  OtherProductReasonPreview,
  OtherProductReasonSummary
} from './reimbursement-requests-types.js';
import { LinkCreateArgs, ProjectProposedChanges, WbsNumber, WorkPackageProposedChanges } from './project-types.js';
import { WorkPackageStage } from './work-package-types.js';

// --- Base type: primitives only ---

export interface ChangeRequestBase {
  crId: string;
  identifier: number;
  type: ChangeRequestType;
  dateSubmitted: Date;
  dateReviewed?: Date;
  accepted?: boolean;
  reviewNotes?: string;
  dateImplemented?: Date;
  status: ChangeRequestStatus;
  wbsNum?: WbsNumber;
  wbsName?: string;
}

// --- Table row type: for list endpoints ---

export interface ChangeRequestTableRow extends ChangeRequestBase {
  submitter: UserPreview;
  reviewer?: UserPreview;
  category?: OtherProductReasonPreview;
  accountCode?: AccountCodePreview;
  implementedChangesCount: number;
  requestedReviewers: UserPreview[];
  // Type-specific fields accessed in list views
  lead?: UserPreview;
  manager?: UserPreview;
  startDate?: Date;
  confirmDetails?: boolean;
  leftoverBudget?: number;
  confirmDone?: boolean;
  proposedBudget?: number;
}

// --- Full detail types: for single CR endpoint ---

export interface FullChangeRequest extends ChangeRequestBase {
  submitter: User;
  reviewer?: User;
  requestedReviewers: User[];
  category?: OtherProductReasonSummary;
  accountCode?: AccountCodeSummary;
  implementedChanges?: ImplementedChange[];
}

export interface FullStandardChangeRequest extends FullChangeRequest {
  what: string;
  why: ChangeRequestExplanation[];
  scopeImpact: string;
  budgetImpact: number;
  timelineImpact: number;
  proposedSolutions: ProposedSolution[];
  projectProposedChanges?: ProjectProposedChanges;
  workPackageProposedChanges?: WorkPackageProposedChanges;
  originalProjectData?: ProjectProposedChanges;
  originalWorkPackageData?: WorkPackageProposedChanges;
}

export interface FullActivationChangeRequest extends FullChangeRequest {
  lead: User;
  manager: User;
  startDate: Date;
  confirmDetails: boolean;
}

export interface FullStageGateChangeRequest extends FullChangeRequest {
  leftoverBudget: number;
  confirmDone: boolean;
}

export interface FullBudgetChangeRequest extends FullChangeRequest {
  proposedBudget: number;
}

export interface FullLeadershipChangeRequest extends FullChangeRequest {
  lead?: User;
  manager?: User;
}

// --- Legacy types (deprecated, kept for migration) ---

/** @deprecated Use ChangeRequestTableRow or FullChangeRequest instead */
export interface ChangeRequest {
  crId: string;
  identifier: number;
  wbsNum?: WbsNumber;
  wbsName?: string;
  category?: OtherProductReason;
  accountCode?: AccountCode;
  submitter: User;
  dateSubmitted: Date;
  type: ChangeRequestType;
  reviewer?: User;
  dateReviewed?: Date;
  accepted?: boolean;
  reviewNotes?: string;
  dateImplemented?: Date;
  implementedChanges?: ImplementedChange[];
  status: ChangeRequestStatus;
  requestedReviewers: User[];
}

/** @deprecated Use FullStandardChangeRequest instead */
export interface StandardChangeRequest extends ChangeRequest {
  what: string;
  why: ChangeRequestExplanation[];
  scopeImpact: string;
  budgetImpact: number;
  timelineImpact: number;
  proposedSolutions: ProposedSolution[];
  projectProposedChanges?: ProjectProposedChanges;
  workPackageProposedChanges?: WorkPackageProposedChanges;
  originalProjectData?: ProjectProposedChanges;
  originalWorkPackageData?: WorkPackageProposedChanges;
}

export interface ProposedSolution {
  id: string;
  description: string;
  scopeImpact: string;
  budgetImpact: number;
  timelineImpact: number;
  createdBy: User;
  dateCreated: Date;
  approved: boolean;
}

/** @deprecated Use FullActivationChangeRequest instead */
export interface ActivationChangeRequest extends ChangeRequest {
  lead: User;
  manager: User;
  startDate: Date;
  confirmDetails: boolean;
}

/** @deprecated Use FullStageGateChangeRequest instead */
export interface StageGateChangeRequest extends ChangeRequest {
  leftoverBudget: number;
  confirmDone: boolean;
}

/** @deprecated Use FullBudgetChangeRequest instead */
export interface BudgetChangeRequest extends ChangeRequest {
  proposedBudget: number;
}

/** @deprecated Use FullLeadershipChangeRequest instead */
export interface LeadershipChangeRequest extends ChangeRequest {
  lead?: User;
  manager?: User;
}

export const ChangeRequestType = {
  Issue: 'ISSUE',
  Redefinition: 'DEFINITION_CHANGE',
  Other: 'OTHER',
  StageGate: 'STAGE_GATE',
  Activation: 'ACTIVATION',
  Budget: 'BUDGET',
  Leadership: 'LEADERSHIP'
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ChangeRequestType = (typeof ChangeRequestType)[keyof typeof ChangeRequestType];

export interface ChangeRequestExplanation {
  type: ChangeRequestReason;
  explain: string;
}

export enum ChangeRequestReason {
  Estimation = 'ESTIMATION',
  School = 'SCHOOL',
  Design = 'DESIGN',
  Manufacturing = 'MANUFACTURING',
  Rules = 'RULES',
  Initialization = 'INITIALIZATION',
  Competition = 'COMPETITION',
  Maintenance = 'MAINTENANCE',
  OtherProject = 'OTHER_PROJECT',
  Other = 'OTHER'
}

export enum ChangeRequestStatus {
  Implemented = 'Implemented',
  Accepted = 'Accepted',
  Denied = 'Denied',
  Open = 'Open'
}

export interface ImplementedChange {
  changeId: string;
  changeRequestId: string;
  changeRequestIdentifier: number;
  wbsNum?: WbsNumber;
  category?: OtherProductReason;
  accountCode?: AccountCode;
  implementer: User;
  detail: string;
  dateImplemented: Date;
}

export interface ProposedSolutionCreateArgs {
  description: string;
  scopeImpact: string;
  budgetImpact: number;
  timelineImpact: number;
}

export interface ProposedSolutionFormInput extends ProposedSolutionCreateArgs {
  id: string;
}

export interface DescriptionBulletPreview {
  id: string;
  detail: string;
  type: string;
}

export interface WBSProposedChangesCreateArgs {
  name: string;
  leadId?: string;
  managerId?: string;
  descriptionBullets: DescriptionBulletPreview[];
  links: LinkCreateArgs[];
}

export interface ProjectProposedChangesCreateArgs extends WBSProposedChangesCreateArgs {
  budget: number;
  summary: string;
  teamIds: string[];
  workPackageProposedChanges: WorkPackageProposedChangesCreateArgs[];
  carNumber?: number;
}

export interface WorkPackageProposedChangesCreateArgs extends WBSProposedChangesCreateArgs {
  duration: number;
  startDate: string;
  stage?: WorkPackageStage;
  blockedBy: WbsNumber[];
}

export interface LeadershipChangeCreateArgs {
  submitterId: string;
  wbsNum: WbsNumber;
  leadId?: string;
  managerId?: string;
}
