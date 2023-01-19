import { project1, wbsElement1 } from './projects.test-data';
import { batman, superman, wonderwoman, flash } from './users.test-data';
import { Team as PrismaTeam, Prisma } from '@prisma/client';
import { Team as SharedTeam } from 'shared/src/types/team-types';
import teamQueryArgs from '../../src/prisma-query-args/teams.query-args';

const teamId = 'id1';
const teamName = 'pats';
const slackId = '69';
const description = 'best team no cap';

export const prismaTeam1: PrismaTeam = {
  teamId,
  teamName,
  slackId,
  description,
  leaderId: flash.userId
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
  projects: [{ ...project1, wbsElement: wbsElement1 }],
  members: [superman, wonderwoman]
};
