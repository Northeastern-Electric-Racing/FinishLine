import { wbsPipe, WorkPackage } from 'shared';
import { Box, MenuItem, Select, useTheme, SelectChangeEvent } from '@mui/material';
import {
  getInProgressWorkPackages,
  getOverdueWorkPackages,
  getUpcomingWorkPackages
} from '../../../utils/work-package.utils';
import { useCurrentUser } from '../../../hooks/users.hooks';
import PageBlock from '../../../layouts/PageBlock';
import WorkPackageCard from './WorkPackageCard';
import { useEffect, useState } from 'react';

const WorkPackagesSelectionView: React.FC = () => {
  const user = useCurrentUser();
  const theme = useTheme();

  enum WPGroup {
    upcoming = 'upcoming',
    inProgress = 'inProgress',
    overdue = 'overdue'
  }
  const [currentDisplayedWPs, setCurrentDisplayedWPs] = useState<WPGroup>(WPGroup.upcoming);

  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  };

  useEffect(() => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; wpGroup=`);
    let savedGroup;
    if (parts.length === 2) {
      savedGroup = parts.pop()?.split(';').shift();
    }
    if (savedGroup) {
      setCurrentDisplayedWPs(savedGroup as WPGroup);
    }
  }, []);

  if (!user.teamAsHeadId) {
    throw new Error('rwge4rwa');
  }

  const relevantWPs = user.teamsAsHeadId.map((team) => team.projects.map((project) => project.workPackages)).flat(2);

  const upcomingWPs: WorkPackage[] = getUpcomingWorkPackages(relevantWPs);
  const inProgressWPs: WorkPackage[] = getInProgressWorkPackages(relevantWPs);
  const overdueWPs: WorkPackage[] = getOverdueWorkPackages(relevantWPs);

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value as WPGroup;
    setCookie('wpGroup', value, 7);
    setCurrentDisplayedWPs(value);
  };

  const getWorkPackages = (key: WPGroup): WorkPackage[] => {
    switch (key) {
      case WPGroup.upcoming:
        return upcomingWPs;
      case WPGroup.inProgress:
        return inProgressWPs;
      case WPGroup.overdue:
        return overdueWPs;
    }
  };

  const workPackagesDisplay = (workPackages: WorkPackage[]) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        overflowY: 'auto',
        justifyContent: 'flex-start',
        height: '50vh',
        gap: 2,
        '&::-webkit-scrollbar': {
          width: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        }
      }}
    >
      {workPackages.length === 0
        ? `No work packages`
        : workPackages.map((wp) => (
            <Box key={wbsPipe(wp.wbsNum)}>
              <WorkPackageCard wp={wp} />
            </Box>
          ))}
    </Box>
  );

  return (
    <Box sx={{ width: '40%', float: 'left' }}>
      <PageBlock>
        <Select value={currentDisplayedWPs.toString()} disableUnderline variant="standard" onChange={handleChange}>
          <MenuItem value={WPGroup.upcoming.toString()}>Upcoming Work Packages</MenuItem>
          <MenuItem value={WPGroup.inProgress.toString()}>In Progress Work Packages</MenuItem>
          <MenuItem value={WPGroup.overdue.toString()}>Overdue Work Packages</MenuItem>
        </Select>
        {workPackagesDisplay(getWorkPackages(currentDisplayedWPs))}
      </PageBlock>
    </Box>
  );
};

export default WorkPackagesSelectionView;
