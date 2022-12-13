/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Team } from 'shared';
import { routes } from '../../utils/routes';
import { fullNamePipe, wbsPipe } from '../../utils/pipes';
import { Card, CardContent, CardActions, Button, Link, Typography } from '@mui/material';
interface TeamSummaryProps {
  team: Team;
}

const TeamSummary: React.FC<TeamSummaryProps> = ({ team }) => {
  const projectsList = team.projects.map((project, idx) => (
    <>
      <Link href={`${routes.PROJECTS}/${wbsPipe(project.wbsNum)}`}>{project.name}</Link>
      {idx + 1 !== team.projects.length ? ', ' : ''}
    </>
  ));

  return (
    <Card sx={{ minWidth: 300, maxWidth: 400, minHeight: 200 }}>
      <CardContent>
        <Typography variant="h5">{team.teamName}</Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {team.projects.length} Project{team.projects.length === 1 ? '' : 's'} | {team.members.length} Member
          {team.members.length === 1 ? '' : 's'}
        </Typography>
        <Typography variant="body2">
          <b>Lead:</b> {fullNamePipe(team.leader)}
        </Typography>
        <Typography variant="body2">
          <b>Projects:</b> {projectsList}
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="outlined" size="small" component={Link} href={`${routes.TEAMS}/${team.teamId}`}>
          See More
        </Button>
      </CardActions>
    </Card>
  );
};

export default TeamSummary;
