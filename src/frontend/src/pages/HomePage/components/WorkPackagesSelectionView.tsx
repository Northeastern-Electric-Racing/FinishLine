import { WorkPackage } from 'shared';
import { Box, Card, CardContent, useTheme } from '@mui/material';
import {
  getInProgressWorkPackages,
  getOverdueWorkPackages,
  getUpcomingWorkPackages
} from '../../../utils/work-package.utils';
import { useCurrentUser } from '../../../hooks/users.hooks';
import WorkPackageCard from './WorkPackageCard';
import WorkPackageSelect from './WorkPackageSelect';
import React, { useState } from 'react';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

const NoWorkPackages: React.FC = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 70 }} />}
      heading={`You're all set!`}
      message={'You have no pending work packages of this type!'}
    />
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

  const WorkPackagesDisplay = (workPackages: WorkPackage[]) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'auto',
        width: '100%',
        gap: 2
      }}
    >
      {workPackages.map((wp) => (
        <Box
          sx={{
            maxWidth: 'fit-content'
          }}
        >
          <WorkPackageCard wp={wp} />
        </Box>
      ))}
    </Box>
  );

  const [, currentWps] = workPackages[currentDisplayedWPs]; //getWorkPackages(currentDisplayedWPs);

  return (
    <Card
      sx={{
        height: '100%',
        background: theme.palette.background.paper
      }}
      variant="outlined"
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexWrap: 'nowrap'
        }}
      >
        <WorkPackageSelect
          options={workPackages.map((wp) => wp[0])}
          onSelect={setCurrentDisplayedWPs}
          firstSelected={currentDisplayedWPs}
        />
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            gap: 2,
            overflowX: 'hidden',
            overflowY: 'auto',
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
            },
            scrollbarWidth: 'auto',
            scrollbarColor: `${theme.palette.primary.main} transparent`
          }}
        >
          <Box sx={{ flex: 1 }}>{currentWps.length === 0 ? <NoWorkPackages /> : WorkPackagesDisplay(currentWps)}</Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WorkPackagesSelectionView;
