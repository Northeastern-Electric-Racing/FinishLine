/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet } from './project-types';
import { DescriptionBulletPreview } from './change-request-types';
import { TeamPreview } from './team-types';
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

export interface WbsElementTemplate {
  templateName: string;
  templateNotes: string;
  descriptionBullets: DescriptionBullet[];
}

export type WorkPackageTemplatePreview = Pick<
  WorkPackageTemplate,
  'workPackageTemplateId' | 'templateName' | 'stage' | 'templateNotes'
>;

export interface WorkPackageTemplate extends WbsElementTemplate {
  workPackageTemplateId: string;
  workPackageName?: string;
  stage?: WorkPackageStage;
  duration?: number;
  blockedBy: WorkPackageTemplatePreview[];
  dateCreated: Date;
  userCreated: User;
  dateDeleted?: Date;
  userDeleted?: User;
}

export interface WorkPackageTemplateApiInputs {
  templateName: string;
  templateNotes: string;
  duration: number | undefined;
  stage?: WorkPackageStage | 'NONE';
  blockedBy: string[];
  descriptionBullets: DescriptionBulletPreview[];
  workPackageName?: string;
  workPackageTemplateId?: string;
}

export interface ProjectTemplate extends WbsElementTemplate {
  projectTemplateId: string;
  projectName?: string;
  workPackageTemplates: WorkPackageTemplate[];
  budget?: number;
  teams: TeamPreview[];
  summary?: string;
}

export type WorkPackageSelection = 'allOverdue' | 'leading' | 'member';
