import { User } from 'shared';
import { someProject } from './projects.test-data';
import { batman, flash, superman, wonderwoman } from './users.test-data';

export const bruhTeam = {
  teamID: '4',
  teamName: 'Dogs',
  leader: batman,
  slackID: 'hello',
  description: 'Team of dogs',
  members: [batman],
  projects: [someProject]
};

export const BatmanSuperman = {
  teamID: '5',
  teamName: 'Bats',
  leader: superman,
  slackID: 'twoDCpeople',
  description: 'Toxic masculinity',
  members: [batman, superman],
  projects: [someProject]
};

export const DCtrio = {
  teamID: '6',
  teamName: 'DCGang',
  leader: superman,
  slackID: 'DCcollection',
  description: 'diverse cast',
  members: [batman, superman, flash, wonderwoman],
  projects: [someProject]
};
