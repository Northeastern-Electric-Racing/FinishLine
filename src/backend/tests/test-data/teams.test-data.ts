import { Team as PrismaTeam } from '@prisma/client';
import { Team as SharedTeam } from 'shared/src/types/team-types';
import { flash, superman, wonderwoman } from './users.test-data';

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

export const updatedSharedTeam1: SharedTeam = {
  teamId,
  teamName,
  slackId,
  description,
  leader: flash,
  members: [superman, wonderwoman],
  projects: []
};
