/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TeamPreview } from 'shared';
import { routes } from '../../utils/routes';
import { fullNamePipe, wbsPipe } from '../../utils/pipes';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardActions, Button, Link, Typography } from '@mui/material';
import React from 'react';
import { useHomePageContext } from '../../app/HomePageContext';
import { useSingleTeam } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

interface TeamSummaryProps {
  team: TeamPreview;
}

const TeamSummary: React.FC<TeamSummaryProps> = ({ team }) => {
  const { onPNMHomePage, onOnboardingHomePage } = useHomePageContext();
  const { data, isLoading, isError, error } = useSingleTeam(team.teamId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  const projectsList = data.projects.map((project, idx) => (
    <React.Fragment key={project.name}>
      {onPNMHomePage || onOnboardingHomePage ? (
        <Typography component="span">{project.name}</Typography>
      ) : (
        <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(project.wbsNum)}`}>
          {project.name}
        </Link>
      )}
      {idx + 1 !== data.projects.length ? ', ' : ''}
    </React.Fragment>
  ));

  return (
    <Card sx={{ minWidth: 350, maxWidth: 350, minHeight: 200 }}>
      <CardContent>
        <Typography variant="h5">{team.teamName}</Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {data.projects.length} Project{data.projects.length === 1 ? '' : 's'} | {team.members.length} Member
          {team.members.length === 1 ? '' : 's'} | {team.leads.length} Lead{team.leads.length === 1 ? '' : 's'}
        </Typography>
        <Typography variant="body2">
          <b>Head:</b> {fullNamePipe(team.head)}
        </Typography>
        <Typography noWrap variant="body2">
          <b>Projects:</b> {projectsList}
        </Typography>
      </CardContent>
      <CardActions>
        {!(onPNMHomePage || onOnboardingHomePage) && (
          <Button variant="outlined" size="small">
            <Link component={RouterLink} to={`${routes.TEAMS}/${team.teamId}`}>
              See More
            </Link>
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default TeamSummary;
