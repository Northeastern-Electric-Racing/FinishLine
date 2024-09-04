/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Team } from 'shared';
import { routes } from '../../utils/routes';
import { fullNamePipe, wbsPipe } from '../../utils/pipes';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardActions, Button, Link, Typography } from '@mui/material';
import React from 'react';
import { useHomePageContext } from '../../app/HomePageContext';

interface TeamSummaryProps {
  team: Team;
}

const TeamSummary: React.FC<TeamSummaryProps> = ({ team }) => {
  const { onPNMHomePage } = useHomePageContext();

  const projectsList = team.projects.map((project, idx) => (
    <React.Fragment key={project.name}>
      {onPNMHomePage ? (
        <Typography component="span">{project.name}</Typography>
      ) : (
        <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(project.wbsNum)}`}>
          {project.name}
        </Link>
      )}
      {idx + 1 !== team.projects.length ? ', ' : ''}
    </React.Fragment>
  ));

  return (
    <Card sx={{ minWidth: 350, maxWidth: 350, minHeight: 200 }}>
      <CardContent>
        <Typography variant="h5">{team.teamName}</Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {team.projects.length} Project{team.projects.length === 1 ? '' : 's'} | {team.members.length} Member
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
        <Button variant="outlined" size="small" disabled={onPNMHomePage}>
          <Link component={RouterLink} to={`${routes.TEAMS}/${team.teamId}`}>
            See More
          </Link>
        </Button>
      </CardActions>
    </Card>
  );
};

export default TeamSummary;
