import { batman, superman, wonderwoman, flash, alfred } from './users.test-data';
import { Prisma } from '@prisma/client';
import { Team as SharedTeam } from 'shared/src/types/team-types';
import teamQueryArgs from '../../src/prisma-query-args/teams.query-args';

const teamId = 'id1';
const teamName = 'pats';
const slackId = '69';
const description = 'best team no cap';

export const prismaTeam1: Prisma.TeamGetPayload<typeof teamQueryArgs> = {
  teamId,
  teamName,
  slackId,
  description,
  leader: flash,
  leaderId: 4,
  projects: [],
  members: [batman, wonderwoman, alfred]
};

export const primsaTeam2: Prisma.TeamGetPayload<typeof teamQueryArgs> = {
  teamId,
  teamName,
  slackId,
  description,
  leader: alfred,
  leaderId: 10,
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

export const justiceLeague: Prisma.TeamGetPayload<typeof teamQueryArgs> = {
  teamId: '1',
  teamName: 'Justice League',
  description: 'hiii :3',
  slackId: '1234',
  leaderId: 1,
  leader: batman,
  projects: [],
  members: [superman, wonderwoman]
};
