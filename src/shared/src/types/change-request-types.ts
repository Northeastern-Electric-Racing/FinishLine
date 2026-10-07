/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types.js';
import { AccountCode, OtherProductReason } from './reimbursement-requests-types.js';
import { LinkCreateArgs, ProjectProposedChanges, WbsNumber, WorkPackageProposedChanges } from './project-types.js';
import { WorkPackageStage } from './work-package-types.js';

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

export const ChangeRequestType = {
  Standard: 'STANDARD',
  StageGate: 'STAGE_GATE',
  Activation: 'ACTIVATION',
  Budget: 'BUDGET',
  Leadership: 'LEADERSHIP'
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ChangeRequestType = (typeof ChangeRequestType)[keyof typeof ChangeRequestType];

export interface StandardChangeRequest extends ChangeRequest {
  why: string;
  projectProposedChanges?: ProjectProposedChanges;
  workPackageProposedChanges?: WorkPackageProposedChanges;
  originalProjectData?: ProjectProposedChanges;
  originalWorkPackageData?: WorkPackageProposedChanges;
}

export interface GuestChangeRequest {
  crId: string;
  submitter: User;
  identifier: number;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  teamTypeNames: string[];
  accepted?: boolean;
  reviewer?: User;
  wbsNum?: WbsNumber;
  wbsName?: string;
}

export interface ActivationChangeRequest extends ChangeRequest {
  lead: User;
  manager: User;
  startDate: Date;
  confirmDetails: boolean;
}

export interface StageGateChangeRequest extends ChangeRequest {
  leftoverBudget: number;
  confirmDone: boolean;
}

export interface BudgetChangeRequest extends ChangeRequest {
  proposedBudget: number;
}

export interface LeadershipChangeRequest extends ChangeRequest {
  lead?: User;
  manager?: User;
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
