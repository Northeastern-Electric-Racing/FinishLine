/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { EventStatus } from './calendar-types.js';
import { ImplementedChange } from './change-request-types.js';
import { BaseTask, TaskBlockerPreview } from './task-types.js';
import { TeamPreview } from './team-types.js';
import { BaseUser, User, UserPreview } from './user-types.js';
import { BaseWorkPackage, WorkPackageBlocker, WorkPackageChange, WorkPackageStage } from './work-package-types.js';

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

/** What projects and work packages have in common, for code that handles both (the gantt charts) */
export interface BaseWbsElement {
  id: string; // project / work package id
  wbsElementId: string;
  wbsNum: WbsNumber;
  name: string;
  status: WbsElementStatus;
  lead?: BaseUser;
  manager?: BaseUser;
}

export interface ProjectTeam {
  teamId: string;
  teamName: string;
}

/** The minimum every consumer of a project needs. Status, dates, and duration are derived from its work packages */
export interface BaseProject extends BaseWbsElement {
  budget: number;
  summary: string;
  abbreviation?: string;
  teams: ProjectTeam[];
  startDate?: Date;
  endDate?: Date;
  duration: number;
}

/** The all-projects list: the projects table, project pickers, the guest projects page, team pages, and featured projects */
export interface ProjectListItem extends BaseProject {
  numWorkPackages: number;
  teamTypes: { teamTypeId: string; name: string }[];
  // stage of the first active work package, shown as a chip on guest project cards
  activeStage?: WorkPackageStage;
}

/** A link as a card or page shows it */
export interface ProjectLink {
  linkId: string;
  url: string;
  linkType: Pick<LinkType, 'name' | 'iconName'>;
}

/** Projects page overview cards: leading, my teams, and favorites */
export interface ProjectOverviewCard extends BaseProject {
  tasksRemaining: number;
  confluenceLink?: Omit<ProjectLink, 'linkId'>;
  activeWorkPackages: BaseWorkPackage[];
}

/** A design review, shown as a marker on a work package's gantt bar */
export interface DesignReviewMarker {
  eventId: string;
  dateScheduled: Date;
  status: EventStatus;
  // the work package's name, shown on hover
  wbsName: string;
}

/** A work package on a gantt chart */
export interface GanttWorkPackage extends BaseWorkPackage {
  blocking: WbsNumber[];
  events: DesignReviewMarker[];
}

/** A task on the gantt chart */
export interface GanttProjectTask extends BaseTask {
  startDate?: Date;
  createdBy: BaseUser;
  // sent back unchanged when a gantt edit moves the task
  blockedBy: Pick<TaskBlockerPreview, 'taskId'>[];
}

/** The gantt chart page */
export interface ProjectGanttItem extends BaseProject {
  workPackages: GanttWorkPackage[];
  tasks: GanttProjectTask[];
}

/** A work package on the project detail page: summary accordions, the gantt tab, the work package form, and change request diffs */
export interface ProjectDetailWorkPackage extends GanttWorkPackage {
  blockedBy: WorkPackageBlocker[];
  descriptionBullets: Pick<DescriptionBullet, 'id' | 'detail' | 'type'>[];
}

/** The project detail page, its edit form, and change request diffs */
export interface ProjectDetail extends BaseProject {
  links: ProjectLink[];
  descriptionBullets: BaseDescriptionBullet[];
  changes: WorkPackageChange[];
  workPackages: ProjectDetailWorkPackage[];
  isFavorited: boolean;
  // whether the current user heads, leads, or is a member of one of the project's teams
  isOnProjectTeam: boolean;
}

/** A work package on the retrospective chart, with its schedule before the chosen window's changes */
export interface RetrospectiveWorkPackage extends GanttWorkPackage {
  isBlocked: boolean;
  originalStartDate: Date;
  originalDuration: number;
}

/** The retrospective chart */
export interface RetrospectiveProject extends BaseProject {
  originalStartDate?: Date;
  originalEndDate?: Date;
  tasks: GanttProjectTask[];
  workPackages: RetrospectiveWorkPackage[];
}

/** A description bullet as a page shows it: deleted bullets are filtered out before they're sent */
export type BaseDescriptionBullet = Omit<DescriptionBullet, 'dateDeleted'>;

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
