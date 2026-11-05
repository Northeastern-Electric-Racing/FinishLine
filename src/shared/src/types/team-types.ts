/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BaseProject, BaseWorkPackage, WbsElementStatus, WbsNumber } from './project-types.js';
import { User, UserPreview } from './user-types.js';

/** The minimum every consumer of a team needs. Extend it, don't grow it */
export interface BaseTeam {
  teamId: string;
  teamName: string;
  slackId: string;
  description: string;
  dateArchived?: Date;
  financeTeam: boolean;
  operationsTeam: boolean;
  teamTypeId?: string;
  headId: string;
}

/** @deprecated Use BaseTeam. Still used by teams.services.ts (getAllTeamPreviews), TeamPreview and TeamNamePreview until teams is refactored */
export interface TeamBase {
  teamId: string;
  teamName: string;
  slackId: string;
  description: string;
  dateArchived?: Date;
  teamType?: {
    teamTypeId: string;
    name: string;
  };
}

export interface TeamPreview extends TeamBase {
  members: User[];
  head: User;
  leads: User[];
  userArchived?: User;
}

export type TeamNamePreview = Pick<TeamBase, 'teamId' | 'teamName'>;

export interface TeamProjectPreview {
  name: string;
  wbsNum: WbsNumber;
}

export interface TeamWithProjects {
  teamId: string;
  teamName: string;
  dateArchived?: Date;
  head: UserPreview;
  memberCount: number;
  leadCount: number;
  projects: TeamProjectPreview[];
}

/** A project card on the team pages: its status and budget, and its work packages' stages for the guest card */
export interface TeamProject extends BaseProject {
  status: WbsElementStatus;
  workPackages: Pick<BaseWorkPackage, 'status' | 'stage'>[];
}

export interface Team extends TeamPreview {
  projects: TeamProject[];
}

export type TeamJoinRequestStatus = 'PENDING' | 'APPROVED' | 'DENIED';

export interface TeamJoinRequest {
  teamJoinRequestId: string;
  user: User;
  team: TeamPreview;
  status: TeamJoinRequestStatus;
  dateRequested: Date;
  denialReason?: string;
  reviewedBy?: User;
  dateReviewed?: Date;
}
