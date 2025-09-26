/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, UserPreview } from './user-types';
import { ImplementedChange } from './change-request-types';
import { WorkPackageStage } from './work-package-types';
import { TeamPreview } from './team-types';
import { DesignReviewPreview, Task, TeamType } from 'shared';

export interface WbsNumber {
  carNumber: number;
  projectNumber: number;
  workPackageNumber: number;
}

export interface WbsElement {
  wbsElementId: string; // wbs element id
  id: string; // project/ work package id
  wbsNum: WbsNumber;
  dateCreated: Date;
  deleted: boolean;
  name: string;
  status: WbsElementStatus;
  lead?: User;
  manager?: User;
  links: Link[];
  changes: ImplementedChange[];
  descriptionBullets: DescriptionBullet[];
}

export type WbsElementPreview = Omit<WbsElement, 'changes' | 'materials' | 'assemblies' | 'descriptionBullets'>;

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
  favoritedBy: UserPreview[];
  abbreviation?: string;
}

export type RetrospectiveProjectPreview = Omit<ProjectPreview, 'workPackages'> & {
  workPackages: RetrospectiveWorkPackage[];
  originalStartDate?: Date;
  originalEndDate?: Date;
};

export interface ProjectPreview extends WbsElementPreview {
  startDate?: Date;
  endDate?: Date;
  budget: number;
  teams: TeamPreview[];
  workPackages: WorkPackage[];
  tasks: Task[];
  duration: number;
  abbreviation?: string;
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
  designReviews: DesignReviewPreview[];
}

export interface WorkPackagePreview extends WbsElementPreview {
  projectName: string;
  projectId: string;
  startDate: Date;
  duration: number;
  endDate: Date;
  stage?: WorkPackageStage;
}

export interface DescriptionBullet {
  id: string;
  detail: string;
  dateAdded: Date;
  type: string;
  dateDeleted?: Date;
  userChecked?: Pick<User, 'firstName' | 'lastName'>;
  dateChecked?: Date;
}

export interface LinkType {
  name: string;
  dateCreated: Date;
  creator: UserPreview;
  required: boolean;
  iconName: string;
}

export interface Link {
  linkId: string;
  linkType: LinkType;
  dateCreated: Date;
  creator: User;
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
  lead?: UserPreview;
  manager?: UserPreview;
}

export interface ProjectProposedChanges extends WbsProposedChanges {
  summary: string;
  budget: number;
  teams: TeamPreview[];
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
}

export interface DescriptionBulletTypeCreatePayload {
  name: string;
  workPackageRequired: boolean;
  projectRequired: boolean;
}

export interface Car extends WbsElement {}
