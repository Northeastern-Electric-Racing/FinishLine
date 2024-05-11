/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types';

export enum TimelineStatus {
  Ahead = 'AHEAD',
  OnTrack = 'ON_TRACK',
  Behind = 'BEHIND',
  VeryBehind = 'VERY_BEHIND'
}

export enum WorkPackageStage {
  Research = 'RESEARCH',
  Design = 'DESIGN',
  Manufacturing = 'MANUFACTURING',
  Install = 'INSTALL',
  Testing = 'TESTING'
}

export interface BlockedByInfo {
  blockedByInfoId: string;
  stage?: WorkPackageStage;
  name: string;
}

export interface WorkPackageTemplate {
  workPackageTemplateId: string;
  templateName: string;
  templateNotes: string;
  workPackageName?: string;
  stage?: WorkPackageStage;
  duration?: number;
  blockedBy: WorkPackageTemplate[];
  expectedActivities: String[];
  deliverables: String[];
  dateCreated: Date;
  userCreated: User;
  userCreatedId: Number;
  dateDeleted?: Date;
  userDeleted?: User;
  userDeletedId?: Number;
}

export interface BlockedByCreateArgs {
  blockedByInfoId?: string;
  stage?: WorkPackageStage;
  name: string;
}
