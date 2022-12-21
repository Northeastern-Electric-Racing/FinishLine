import { project1, wbsElement1 } from './projects.test-data';
import { batman, superman, wonderwoman } from './users.test-data';

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
