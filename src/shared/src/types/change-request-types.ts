/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types';
import { DescriptionBullet, Link, WbsElementStatus, WbsNumber } from './project-types';
import { WorkPackageStage } from './work-package-types';
import { TeamPreview } from './team-types';

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
  wbsProposedChanges?: WbsProposedChanges;
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

export interface WbsProposedChanges {
  id: number;
  wbsNum: WbsNumber;
  dateCreated: Date;
  name: string;
  status: WbsElementStatus;
  projectLead?: User;
  projectManager?: User;
  links: Link[];
  changeRequest: ChangeRequest;
  proposedProjectChanges: ProposedProjectChanges;
  workPackageProposedChanges: WorkPackageProposedChanges;
}

export interface ProposedProjectChanges {
  id: number;
  summary: string;
  budget: number;
  rules: string[];
  goals: DescriptionBullet[];
  features: DescriptionBullet[];
  otherConstraints: DescriptionBullet[];
  teams: TeamPreview[];
  newProject: boolean;
  proposedWbsChanges: WbsProposedChanges;
}

export interface WorkPackageProposedChanges {
  id: number;
  duration: number;
  expectedProgress: number;
  blockedBy: WbsNumber[];
  expectedActivities: DescriptionBullet[];
  deliverables: DescriptionBullet[];
  projectName: string;
  stage?: WorkPackageStage;
  startDate: Date;
  proposedWbsChanges: WbsProposedChanges;
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
  linkIds: string[];
}

export interface ProjectProposedChangesCreateArgs {
  budget: number;
  summary: string;
  newProject: boolean;
  goalIds: number[];
  featureIds: number[];
  otherConstraintIds: number[];
  rules: string[];
  teamIds: string[];
}

export interface WorkPackageProposedChangesCreateArgs {
  duration: number;
  startDate: string;
  stage: WorkPackageStage | null;
  blockedBy: WbsNumber[];
  expectedActivityIds: number[];
  deliverableIds: number[];
}
