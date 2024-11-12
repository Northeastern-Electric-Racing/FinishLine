import { wbsPipe, WorkPackage } from 'shared';
import { Box, Grid, useTheme } from '@mui/material';
import {
  getInProgressWorkPackages,
  getOverdueWorkPackages,
  getUpcomingWorkPackages
} from '../../../utils/work-package.utils';
import { useCurrentUser } from '../../../hooks/users.hooks';
import PageBlock from '../../../layouts/PageBlock';
import WorkPackageCard from './WorkPackageCard';
import WorkPackageSelect from './WorkPackageSelect';
import React, { useState } from 'react';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

const NoWorkPackages: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '40vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <EmptyPageBlockDisplay
        icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 70 }} />}
        heading={`You're all caught up!`}
        message={'You have no pending work packages of this type!'}
      />
    </Box>
  );
};

const WorkPackagesSelectionView: React.FC = () => {
  const user = useCurrentUser();
  const theme = useTheme();

  const relevantWPs = user.teamsAsHead
    ? user.teamsAsHead.map((team) => team.projects.map((project) => project.workPackages)).flat(2)
    : [];

  relevantWPs.concat(
    user.teamsAsLead ? user.teamsAsLead.map((team) => team.projects.map((project) => project.workPackages)).flat(2) : []
  );

  const upcomingWPs: WorkPackage[] = getUpcomingWorkPackages(relevantWPs);
  const inProgressWPs: WorkPackage[] = getInProgressWorkPackages(relevantWPs);
  const overdueWPs: WorkPackage[] = getOverdueWorkPackages(relevantWPs);

  const workPackages: [string, WorkPackage[]][] = [
    [`Upcoming Work Packages (${upcomingWPs.length})`, upcomingWPs],
    [`In Progress Work Packages (${inProgressWPs.length})`, inProgressWPs],
    [`Overdue Work Packages (${overdueWPs.length})`, overdueWPs]
  ];

  let defaultFirstDisplay = 2;
  if (workPackages[2][1].length === 0) {
    defaultFirstDisplay = 1;
    if (workPackages[1][1].length === 0) {
      defaultFirstDisplay = 0;
    }
  }

  const [currentDisplayedWPs, setCurrentDisplayedWPs] = useState<number>(defaultFirstDisplay);

  const handleChange = (event: number) => {
    setCurrentDisplayedWPs(event);
  };

  const getWorkPackages = (key: number): WorkPackage[] => {
    return workPackages[key][1];
  };

  const workPackagesDisplay = (workPackages: WorkPackage[]) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        overflowY: 'auto',
        overflowX: 'hidden',
        justifyContent: 'flex-start',
        height: '40vh',
        gap: 2,
        '&::-webkit-scrollbar': {
          width: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.main,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        }
      }}
    >
      <Grid container rowSpacing={2}>
        {workPackages.map((wp) => (
          <Grid item xs={12} md={6}>
            <Box key={wbsPipe(wp.wbsNum)}>
              <WorkPackageCard wp={wp} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const currentWps = getWorkPackages(currentDisplayedWPs);

  return (
    <PageBlock>
      <WorkPackageSelect
        options={workPackages.map((wp) => wp[0])}
        onSelect={handleChange}
        firstSelected={currentDisplayedWPs}
      />
      {currentWps.length === 0 ? <NoWorkPackages /> : workPackagesDisplay(currentWps)}
    </PageBlock>
  );
};

export default WorkPackagesSelectionView;
