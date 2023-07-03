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
  head: flash,
  headId: 4,
  projects: [],
  members: [batman, wonderwoman, alfred],
  leads: [superman]
};

export const primsaTeam2: Prisma.TeamGetPayload<typeof teamQueryArgs> = {
  teamId,
  teamName,
  slackId,
  description,
  head: alfred,
  headId: 10,
  projects: [],
  members: [],
  leads: []
};

export const sharedTeam1: SharedTeam = {
  teamId,
  teamName,
  slackId,
  description,
  head: flash,
  members: [],
  projects: [],
  leads: [wonderwoman, batman]
};

export const justiceLeague: Prisma.TeamGetPayload<typeof teamQueryArgs> = {
  teamId: '1',
  teamName: 'Justice League',
  description: 'hiii :3',
  slackId: '1234',
  headId: 1,
  head: batman,
  projects: [],
  members: [superman, wonderwoman],
  leads: [batman, flash]
};
