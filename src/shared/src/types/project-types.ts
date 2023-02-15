/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types';
import { ImplementedChange } from './change-request-types';
import { TimelineStatus, WorkPackageStage } from './work-package-types';
import { TeamPreview } from './team-types';
import { Risk } from './risk-types';
import { Task } from 'shared';

export interface WbsNumber {
  carNumber: number;
  projectNumber: number;
  workPackageNumber: number;
}

export interface WbsElement {
  id: number;
  wbsNum: WbsNumber;
  dateCreated: Date;
  name: string;
  status: WbsElementStatus;
  projectLead?: User;
  projectManager?: User;
  changes: ImplementedChange[];
}

export enum WbsElementStatus {
  Inactive = 'INACTIVE',
  Active = 'ACTIVE',
  Complete = 'COMPLETE'
}

export interface Project extends WbsElement {
  summary: string;
  budget: number;
  gDriveLink?: string;
  taskListLink?: string;
  slideDeckLink?: string;
  bomLink?: string;
  rules: string[];
  endDate?: Date;
  duration: number;
  startDate?: Date;
  goals: DescriptionBullet[];
  features: DescriptionBullet[];
  otherConstraints: DescriptionBullet[];
  workPackages: WorkPackage[];
  team?: TeamPreview;
  risks: Risk[];
  tasks: Task[];
}

export type ProjectPreview = Pick<Project, 'id' | 'name' | 'wbsNum' | 'status'>;

export interface WorkPackage extends WbsElement {
  orderInProject: number;
  progress: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  expectedProgress: number;
  timelineStatus: TimelineStatus;
  dependencies: WbsNumber[];
  expectedActivities: DescriptionBullet[];
  deliverables: DescriptionBullet[];
  projectName: string;
  stage?: WorkPackageStage;
}

export interface DescriptionBullet {
  id: number;
  detail: string;
  dateAdded: Date;
  dateDeleted?: Date;
  userChecked?: User;
}
