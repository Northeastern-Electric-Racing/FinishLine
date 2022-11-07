import { batman, flash } from './users.test-data';
import { someProject } from './projects.test-data';

export const JusticeLeague = {
  teamId: '1',
  teamName: 'Justice',
  slackId: '1',
  description: 'Mock team for testing',
  leaderId: 1,
  leader: batman,
  projects: someProject,
  members: { batman, flash }
};
