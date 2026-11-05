/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { EventGanttMarker, EventPreview, TeamType } from './calendar-types.js';
import { ImplementedChange } from './change-request-types.js';
import { Task, TaskGanttItem } from './task-types.js';
import { BaseTeam, TeamPreview } from './team-types.js';
import { BaseUser, User, UserPreview } from './user-types.js';
import { WorkPackageStage } from './work-package-types.js';

export interface WbsNumber {
  carNumber: number;
  projectNumber: number;
  workPackageNumber: number;
}

export interface WbsElementPreview {
  wbsElementId: string; // wbs element id
  id: string; // project/ work package id
  wbsNum: WbsNumber;
  dateCreated: Date;
  deleted: boolean;
  name: string;
  status: WbsElementStatus;
  lead?: UserPreview;
  manager?: UserPreview;
}

export interface WbsElement extends WbsElementPreview {
  links: Link[];
  changes: ImplementedChange[];
  descriptionBullets: DescriptionBullet[];
  lead?: User;
  manager?: User;
}

export enum WbsElementStatus {
  Inactive = 'INACTIVE',
  Active = 'ACTIVE',
  Complete = 'COMPLETE'
}

export interface Project extends WbsElement {
  summary: string;
  budget: number;
  endDate?: Date;
  duration: number;
  startDate?: Date;
  workPackages: WorkPackage[];
  teams: TeamPreview[];
  tasks: Task[];
  favoritedBy: User[];
  abbreviation?: string;
}

export type RetrospectiveProjectPreview = Omit<ProjectGantt, 'workPackages'> & {
  workPackages: RetrospectiveWorkPackage[];
  originalStartDate?: Date;
  originalEndDate?: Date;
};

/**
 * @deprecated Use ProjectGanttItem (or extend BaseProject). Still used by the retrospective (retrospective.services.ts,
 * RetrospectiveProjectPreview) until retro is refactored
 */
export interface ProjectGantt extends WbsElementPreview {
  startDate?: Date;
  endDate?: Date;
  budget: number;
  teams: { teamId: string; teamName: string }[];
  workPackages: WorkPackage[];
  tasks: Task[];
  duration: number;
  abbreviation?: string;
  lead?: User;
  manager?: User;
}

/** The wbs element fields every project and work package carries. Lead and manager are ids; models that display them add the users */
export interface BaseWbsElement {
  wbsElementId: string;
  wbsNum: WbsNumber;
  name: string;
  dateCreated: Date;
  deleted: boolean;
  leadId?: string;
  managerId?: string;
}

// status is still computed from work packages
export interface BaseProject extends BaseWbsElement {
  id: string; // project id
  budget: number;
  summary: string;
  abbreviation?: string;
  carId: string;
}

export interface BaseWorkPackage extends BaseWbsElement {
  id: string; // work package id
  projectId: string;
  status: WbsElementStatus;
  orderInProject: number;
  startDate: Date;
  duration: number;
  endDate: Date;
  stage?: WorkPackageStage;
}

export interface WorkPackageGanttItem extends BaseWorkPackage {
  lead?: BaseUser;
  manager?: BaseUser;
  blocking: WbsNumber[];
  events: EventGanttMarker[];
}

export interface ProjectGanttItem extends BaseProject {
  status: WbsElementStatus;
  lead?: BaseUser;
  manager?: BaseUser;
  teams: { teamId: string }[];
  workPackages: WorkPackageGanttItem[];
  tasks: TaskGanttItem[];
}

export interface ProjectPreview extends WbsElementPreview {
  startDate?: Date;
  endDate?: Date;
  budget: number;
  duration: number;
  abbreviation?: string;
  workPackages: WorkPackagePreview[];
  teams: { teamName: string; teamId: string }[];
  teamTypes: { name: string; teamTypeId: string }[];
}

export interface ProjectOverview extends ProjectPreview {
  links: Link[];
  tasksRemaining: number;
}

export interface RetrospectiveWorkPackage extends WorkPackage {
  originalStartDate: Date;
  originalDuration: number;
}

export interface WorkPackage extends WbsElement {
  orderInProject: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  blockedBy: WbsNumber[];
  blocking: WbsNumber[];
  projectName: string;
  stage?: WorkPackageStage;
  teamTypes: TeamType[];
  projectId: string;
  events: EventPreview[];
}

export interface WorkPackagePreview extends WbsElementPreview {
  projectName: string;
  projectId: string;
  startDate: Date;
  duration: number;
  endDate: Date;
  stage?: WorkPackageStage;
  blockedBy: WbsNumber[];
}

export interface DescriptionBullet {
  id: string;
  detail: string;
  dateAdded: Date;
  type: string;
  dateDeleted?: Date;
  userChecked?: UserPreview;
  dateChecked?: Date;
}

export interface LinkType {
  name: string;
  required: boolean;
  iconName: string;
  isOnGuestHomePage: boolean;
  isOnNewMemberDashboard: boolean;
  isOnOnboardingDashboard: boolean;
}

export interface Link {
  linkId: string;
  linkType: LinkType;
  url: string;
}

export interface LinkCreateArgs {
  linkId: string;
  linkTypeName: string;
  url: string;
}

export interface WbsProposedChanges {
  id: string;
  name: string;
  status: WbsElementStatus;
  links: Link[];
  descriptionBullets: DescriptionBullet[];
  lead?: User;
  manager?: User;
}

export interface ProjectProposedChanges extends WbsProposedChanges {
  summary: string;
  budget: number;
  teams: BaseTeam[];
  carNumber?: number;
  workPackageProposedChanges: WorkPackageProposedChanges[];
}

export interface WorkPackageProposedChanges extends WbsProposedChanges {
  startDate: Date;
  duration: number;
  blockedBy: WbsNumber[];
  stage?: WorkPackageStage;
}

export type WorkPackageProposedChangesPreview = Omit<WorkPackageProposedChanges, 'id' | 'links' | 'status'>;

export type ProjectProposedChangesPreview = Omit<ProjectProposedChanges, 'carNumber' | 'id' | 'status'>;

export interface DescriptionBulletType {
  id: string;
  name: string;
  workPackageRequired: boolean;
  projectRequired: boolean;
}

export interface LinkTypeCreatePayload {
  name: string;
  iconName: string;
  required: boolean;
  isOnGuestHomePage: boolean;
  isOnNewMemberDashboard: boolean;
  isOnOnboardingDashboard: boolean;
}

export interface DescriptionBulletTypeCreatePayload {
  name: string;
  workPackageRequired: boolean;
  projectRequired: boolean;
}

export interface Car extends WbsElement {}
