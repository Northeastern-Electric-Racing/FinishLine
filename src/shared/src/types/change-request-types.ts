/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types';
import { ProjectProposedChanges, WbsElementStatus, WbsNumber, WorkPackageProposedChanges } from './project-types';
import { WorkPackageStage } from './work-package-types';

export interface ChangeRequest {
  crId: number;
  wbsNum: WbsNumber;
  wbsName: string;
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
  Issue: 'ISSUE',
  Redefinition: 'DEFINITION_CHANGE',
  Other: 'OTHER',
  StageGate: 'STAGE_GATE',
  Activation: 'ACTIVATION'
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ChangeRequestType = (typeof ChangeRequestType)[keyof typeof ChangeRequestType];

export interface StandardChangeRequest extends ChangeRequest {
  what: string;
  why: ChangeRequestExplanation[];
  scopeImpact: string;
  budgetImpact: number;
  timelineImpact: number;
  proposedSolutions: ProposedSolution[];
  projectProposedChanges?: ProjectProposedChanges;
  workPackageProposedChanges?: WorkPackageProposedChanges;
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

export interface ActivationChangeRequest extends ChangeRequest {
  projectLead: User;
  projectManager: User;
  startDate: Date;
  confirmDetails: boolean;
}

export interface StageGateChangeRequest extends ChangeRequest {
  leftoverBudget: number;
  confirmDone: boolean;
}

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
  changeId: number;
  changeRequestId: number;
  wbsNum: WbsNumber;
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

export interface WBSProposedChangesCreateArgs {
  name: string;
  status: WbsElementStatus;
  projectLeadId: number;
  projectManagerId: number;
  links: { url: string; linkTypeName: string }[];
}
export interface ProjectProposedChangesCreateArgs extends WBSProposedChangesCreateArgs {
  budget: number;
  summary: string;
  newProject: boolean;
  goals: string[];
  features: string[];
  otherConstraints: string[];
  rules: string[];
  teamIds: string[];
}

export interface WorkPackageProposedChangesCreateArgs extends WBSProposedChangesCreateArgs {
  duration: number;
  startDate: string;
  stage: WorkPackageStage | null;
  blockedBy: WbsNumber[];
  expectedActivities: string[];
  deliverables: string[];
}
