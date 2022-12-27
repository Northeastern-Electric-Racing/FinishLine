/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Team } from 'shared';
import { routes } from '../../utils/Routes';
import { fullNamePipe, wbsPipe } from '../../utils/Pipes';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';

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
        <Typography display="inline" variant="body2" sx={{ fontWeight: 'bold' }}>
          Lead:
        </Typography>
        <Typography display="inline" variant="body2">
          {' '}
          {fullNamePipe(team.leader)}
        </Typography>
        <Typography variant="body2"></Typography>
        <Typography display="inline" variant="body2" sx={{ fontWeight: 'bold' }}>
          Projects:
        </Typography>
        <Typography display="inline" variant="body2">
          {' '}
          {projectsList}
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
