/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TeamType } from './design-review-types';
import { ProjectGantt } from './project-types';
import { User } from './user-types';

export interface Team {
  teamId: string;
  teamName: string;
  head: User;
  slackId: string;
  description: string;
  members: User[];
  projects: ProjectGantt[];
  leads: User[];
  userArchived?: User;
  dateArchived?: Date;
  teamType?: TeamType;
}

export type TeamPreview = Pick<Team, 'teamId' | 'teamName' | 'members' | 'head' | 'leads' | 'teamType' | 'slackId'>;
