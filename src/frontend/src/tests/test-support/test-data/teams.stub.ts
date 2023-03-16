/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Team } from 'shared';
import { exampleProject1, exampleProject2 } from './projects.stub';
import { exampleAllUsers, exampleAppAdminUser } from './users.stub';

export const exampleTeam: Team = {
  teamId: 'a',
  teamName: 'Winners',
  leader: exampleAppAdminUser,
  slackId: 'winners-slackid',
  description: 'Are you winning, team?',
  members: exampleAllUsers,
  projects: [exampleProject1, exampleProject2]
};
