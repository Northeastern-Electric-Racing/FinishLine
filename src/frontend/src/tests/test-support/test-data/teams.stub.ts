/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Team } from 'shared';
import { exampleAdminUser, exampleAllUsers, exampleAppAdminUser, exampleLeadershipUser } from './users.stub';

export const exampleTeam: Team = {
  teamId: 'a',
  teamName: 'Winners',
  head: exampleAppAdminUser,
  slackId: 'winners-slackid',
  description: 'Are you winning, team?',
  members: exampleAllUsers,
  projects: [],
  leads: [exampleLeadershipUser, exampleAdminUser]
};
