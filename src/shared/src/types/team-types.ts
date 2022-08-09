/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProjectPreview } from './project-types';
import { User } from './user-types';

export interface Team {
  teamId: string;
  teamName: string;
  leader: User;
  slackId: string;
  description: string;
  members: User[];
  projects: ProjectPreview[];
}

export type TeamPreview = Pick<Team, 'teamId' | 'teamName'>;
