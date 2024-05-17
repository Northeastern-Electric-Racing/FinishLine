/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, UserPreview } from './user-types';
import { ImplementedChange } from './change-request-types';
import { WorkPackageStage } from './work-package-types';
import { TeamPreview } from './team-types';
import { Assembly, Material, Task } from 'shared';

export interface WbsNumber {
  carNumber: number;
  projectNumber: number;
  workPackageNumber: number;
}

export interface WbsElement {
  wbsElementId: number; // wbs element id
  id: number; // project/ work package id
  wbsNum: WbsNumber;
  dateCreated: Date;
  name: string;
  status: WbsElementStatus;
  lead?: User;
  manager?: User;
  links: Link[];
  changes: ImplementedChange[];
  materials: Material[];
  assemblies: Assembly[];
  descriptionBullets: DescriptionBullet[];
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
  favoritedBy: UserPreview[];
}

export type ProjectPreview = Pick<Project, 'id' | 'name' | 'wbsNum' | 'status'>;

export interface WorkPackage extends WbsElement {
  orderInProject: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  blockedBy: WbsNumber[];
  projectName: string;
  stage?: WorkPackageStage;
}

export interface DescriptionBullet {
  id: number;
  detail: string;
  dateAdded: Date;
  type: string;
  dateDeleted?: Date;
  userChecked?: User;
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
}

export interface WorkPackageProposedChanges extends WbsProposedChanges {
  startDate: Date;
  duration: number;
  blockedBy: WbsNumber[];
  stage?: WorkPackageStage;
}

export type WorkPackageProposedChangesPreview = Omit<WorkPackageProposedChanges, 'id' | 'links' | 'status'>;

export type ProjectProposedChangesPreview = Omit<ProjectProposedChanges, 'carNumber' | 'id' | 'status'>;
