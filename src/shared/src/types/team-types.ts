/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProjectGantt } from './project-types.js';
import { User } from './user-types.js';

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

export interface Team extends TeamPreview {
  projects: ProjectGantt[];
}

export type TeamJoinRequestStatus = 'PENDING' | 'APPROVED' | 'DENIED';

export interface TeamJoinRequest {
  teamJoinRequestId: string;
  user: User;
  team: TeamPreview;
  status: TeamJoinRequestStatus;
  dateRequested: Date;
  denialReason?: string;
}
