import { batman, superman, wonderwoman, flash, alfred, greenlantern, aquaman, theVisitor } from './users.test-data';
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
  members: [aquaman],
  leads: [wonderwoman, alfred]
};

export const primsaTeam2: Prisma.TeamGetPayload<typeof teamQueryArgs> = {
  teamId,
  teamName,
  slackId,
  description,
  head: greenlantern,
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
  head: superman,
  members: [],
  projects: [],
  leads: [alfred]
};

export const justiceLeague: Prisma.TeamGetPayload<typeof teamQueryArgs> = {
  teamId: '1',
  teamName: 'Justice League',
  description: 'hiii :3',
  slackId: '1234',
  headId: 1,
  head: batman,
  projects: [],
  members: [aquaman, theVisitor],
  leads: [wonderwoman]
};
