import { project1, wbsElement1 } from './projects.test-data';
import { batman, superman, wonderwoman, flash } from './users.test-data';
import { Team as PrismaTeam } from '@prisma/client';
import { Team as SharedTeam } from 'shared/src/types/team-types';

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

export const justiceLeague = {
  teamId: '1',
  teamName: 'Justice League',
  description: 'hiii :3',
  slackId: '1234',
  leaderId: 1,
  leader: { ...batman, googleAuthId: 'a' },
  projects: [{ ...project1, wbsElement: wbsElement1 }],
  members: [
    { ...superman, googleAuthId: 'b' },
    { ...wonderwoman, googleAuthId: 'c' }
  ]
};
