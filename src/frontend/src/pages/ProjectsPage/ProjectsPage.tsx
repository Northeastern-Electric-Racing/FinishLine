/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { Button, Grid } from '@mui/material';
import FavoriteProjects from './ProjectsFavorited';
import ProjectsTable from './ProjectsTable';
import LeadOrManagerProjects from './ProjectsLeadOrManager';
import InTeamProjects from './ProjectsInTeam';
import { useAuth } from '../../hooks/auth.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import { isLeadership } from 'shared';

/**
 * Cards of all projects that this user is in their team.
 */

const ProjectsPage: React.FC = () => {
  const auth = useAuth();
  const [render, setRender] = useState(<ProjectsTable />);
  const [selectedButton, setSelectedButton] = useState<string>('all');

  const clickHandler = (page: 'favorite' | 'lead' | 'team' | 'all') => {
    switch (page) {
      case 'favorite':
        setRender(<FavoriteProjects />);
        setSelectedButton('favorite');
        break;
      case 'lead':
        setRender(<LeadOrManagerProjects />);
        setSelectedButton('lead');
        break;
      case 'team':
        setRender(<InTeamProjects />);
        setSelectedButton('team');
        break;
      case 'all':
        setRender(<ProjectsTable />);
        setSelectedButton('all');
        break;
    }
  };

  const permissionView = (
    <>
      <PageTitle title={'Projects'} previousPages={[]} />
      <Grid container justifyContent={'center'}>
        <Grid item>
          <Button
            onClick={() => clickHandler('favorite')}
            color={selectedButton === 'favorite' ? 'primary' : 'secondary'}
            sx={{ '&:hover': { backgroundColor: 'transparent' } }}
          >
            Favorites
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={() => clickHandler('lead')}
            color={selectedButton === 'lead' ? 'primary' : 'secondary'}
            sx={{ '&:hover': { backgroundColor: 'transparent' } }}
          >
            Lead/Manage
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={() => clickHandler('team')}
            color={selectedButton === 'team' ? 'primary' : 'secondary'}
            sx={{ '&:hover': { backgroundColor: 'transparent' } }}
          >
            Your Team
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={() => clickHandler('all')}
            color={selectedButton === 'all' ? 'primary' : 'secondary'}
            sx={{ '&:hover': { backgroundColor: 'transparent' } }}
          >
            All Projects
          </Button>
        </Grid>
        {render}
      </Grid>
    </>
  );

  const noPermissionsView = (
    <>
      <PageTitle title={'Projects'} previousPages={[]} />
      <ProjectsTable />
    </>
  );

  if (!auth.user) return <LoadingIndicator />;

  return <>{isLeadership(auth.user.role) ? permissionView : noPermissionsView}</>;
};

export default ProjectsPage;
