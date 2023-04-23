/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { Button, Grid, Menu, MenuItem } from '@mui/material';
import ProjectsTable from './ProjectsTable';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isGuest, isLeadership } from 'shared';
import ProjectsFavorited from './ProjectsFavorited';
import ProjectsLeadOrManager from './ProjectsLeadOrManager';
import ProjectsInTeam from './ProjectsInTeam';

/**
 * Cards of all projects that this user is in their team.
 */

const ProjectsPage: React.FC = () => {
  const user = useCurrentUser();
  const [render, setRender] = useState(<ProjectsTable />);
  const [selectedButton, setSelectedButton] = useState<string>('all');
  const [overviewSelection, setOverviewSelection] = useState<null | HTMLElement>(null);
  const open = Boolean(overviewSelection);

  const handleOverviewClick = (event: React.MouseEvent<HTMLElement>) => {
    setOverviewSelection(event.currentTarget);
  };

  const handleViewClick = (view: 'favorite' | 'lead' | 'team' | 'all') => {
    switch (view) {
      case 'favorite':
        setRender(<ProjectsFavorited />);
        setSelectedButton('favorite');
        handleClose();
        break;
      case 'lead':
        setRender(<ProjectsLeadOrManager />);
        setSelectedButton('lead');
        handleClose();
        break;
      case 'team':
        setRender(<ProjectsInTeam />);
        setSelectedButton('team');
        handleClose();
        break;
      case 'all':
        setRender(<ProjectsTable />);
        setSelectedButton('all');
        handleClose();
        break;
    }
  };

  const handleClose = () => {
    setOverviewSelection(null);
  };

  const memberView = (
    <>
      <PageTitle title={'Projects'} previousPages={[]} />
      <Grid container justifyContent={'center'}>
        <Grid item>
          <Button
            onClick={handleOverviewClick}
            color={selectedButton !== 'all' ? 'primary' : 'secondary'}
            sx={{ '&:hover': { backgroundColor: 'transparent' } }}
          >
            Overview
          </Button>
          <Menu anchorEl={overviewSelection} open={open} onClose={handleClose}>
            <MenuItem onClick={() => handleViewClick('favorite')}>Favorites</MenuItem>
            {isLeadership(user.role) && <MenuItem onClick={() => handleViewClick('lead')}>Lead Or Mananage</MenuItem>}
            <MenuItem onClick={() => handleViewClick('team')}>Your Team</MenuItem>
          </Menu>
        </Grid>
        <Grid item>
          <Button
            onClick={() => handleViewClick('all')}
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

  const guestView = (
    <>
      <PageTitle title={'Projects'} previousPages={[]} />
      <ProjectsTable />
    </>
  );

  return <>{!isGuest(user.role) ? memberView : guestView}</>;
};

export default ProjectsPage;
