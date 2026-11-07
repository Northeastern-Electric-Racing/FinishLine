/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BaseDescriptionBullet, DescriptionBullet, WbsElementStatus, WbsNumber } from './project-types.js';
import { DescriptionBulletPreview, ImplementedChange } from './change-request-types.js';
import { TeamPreview } from './team-types.js';
import { BaseUser, User } from './user-types.js';

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

/** Whose work packages the home page asks for. When they run is chosen separately, with WorkPackageTimelineFilters */
export enum WorkPackageSelection {
  ALL = 'all',
  LEADING = 'leading',
  MEMBER = 'member'
}

/**
 * Narrows the home page work packages by when they run. Every bound is inclusive and left open when omitted.
 * Complete work packages are always left out unless a status is asked for.
 */
export interface WorkPackageTimelineFilters {
  startsAfter?: Date;
  startsBefore?: Date;
  endsAfter?: Date;
  endsBefore?: Date;
  status?: WbsElementStatus;
}

/** The minimum every consumer of a work package needs. Served as-is by pickers, get-many, by-project and blocking */
export interface BaseWorkPackage {
  id: string;
  wbsElementId: string;
  projectId: string;
  wbsNum: WbsNumber;
  name: string;
  status: WbsElementStatus;
  stage?: WorkPackageStage;
  startDate: Date;
  duration: number;
  endDate: Date;
  orderInProject: number;
  lead?: BaseUser;
  manager?: BaseUser;
  projectName: string;
}

/** A work package that blocks another, named so it can be listed without fetching it */
export interface WorkPackageBlocker {
  wbsNum: WbsNumber;
  name: string;
}

/** A change implemented on a work package, as shown in its changes list */
export type WorkPackageChange = Pick<
  ImplementedChange,
  'changeId' | 'changeRequestId' | 'changeRequestIdentifier' | 'detail' | 'dateImplemented'
> & { implementer: BaseUser };

/** The work package detail page, edit form, change request diff, and activate / stage gate modals */
export interface WorkPackageDetail extends BaseWorkPackage {
  blockedBy: WorkPackageBlocker[];
  descriptionBullets: BaseDescriptionBullet[];
  changes: WorkPackageChange[];
}

/** The home page work package cards (member, leading, and overdue) */
export interface WorkPackageCard extends BaseWorkPackage {
  blockedBy: (WorkPackageBlocker & { projectName: string })[];
}
