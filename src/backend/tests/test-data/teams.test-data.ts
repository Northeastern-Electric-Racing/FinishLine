import { Prisma } from '@prisma/client';
import { Team as SharedTeam } from 'shared/src/types/team-types';
import teamQueryArgs from '../../src/prisma-query-args/teams.query-args';
import { flash } from './users.test-data';

const teamId = 'id1';
const teamName = 'pats';
const slackId = '69';
const description = 'best team no cap';

export const prismaTeam1: Prisma.TeamGetPayload<typeof teamQueryArgs> = {
  teamId,
  teamName,
  slackId,
  description,
  leaderId: flash.userId,
  leader: flash,
  projects: [],
  members: []
};

export const sharedTeam1: SharedTeam = {
  teamId,
  teamName,
  slackId,
  description,
  leader: flash,
  members: [],
  projects: []
};
