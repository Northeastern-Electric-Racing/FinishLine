import { dateToMidnightUTC, WbsElementStatus, WorkPackageCard as WorkPackageCardModel, WorkPackageSelection } from 'shared';
import { Box, Card, CardContent, useTheme } from '@mui/material';
import WorkPackageCard from './WorkPackageCard';
import WorkPackageSelect from './WorkPackageSelect';
import React, { useState } from 'react';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useHomeScreenWorkPackages } from '../../../hooks/work-packages.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';

const NoWorkPackages: React.FC = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 70 }} />}
      heading={`You're all set!`}
      message={'You have no pending work packages of this type!'}
    />
  );
};

const DAY_MS = 24 * 60 * 60 * 1000;

const WorkPackagesSelectionView: React.FC = () => {
  const theme = useTheme();

  // the user's calendar day, in the same midnight-UTC form work package dates are stored in. Fixed for the life of
  // the widget so each bucket's query key stays stable
  const [today] = useState(() => dateToMidnightUTC(new Date()));
  const daysFromToday = (days: number) => new Date(today.getTime() + days * DAY_MS);

  // starts after today, within the next two weeks
  const {
    data: upcomingData,
    isLoading: upcomingIsLoading,
    isError: upcomingIsError,
    error: upcomingError
  } = useHomeScreenWorkPackages(WorkPackageSelection.LEADING, {
    startsAfter: daysFromToday(1),
    startsBefore: daysFromToday(14)
  });
  // active, started by today, and not yet due
  const {
    data: inProgressData,
    isLoading: inProgressIsLoading,
    isError: inProgressIsError,
    error: inProgressError
  } = useHomeScreenWorkPackages(WorkPackageSelection.LEADING, {
    status: WbsElementStatus.Active,
    startsBefore: today,
    endsAfter: daysFromToday(1)
  });
  // due today or earlier
  const {
    data: overdueData,
    isLoading: overdueIsLoading,
    isError: overdueIsError,
    error: overdueError
  } = useHomeScreenWorkPackages(WorkPackageSelection.LEADING, { endsBefore: today });

  const upcomingWPs = upcomingData ?? [];
  const inProgressWPs = inProgressData ?? [];
  const overdueWPs = overdueData ?? [];

  // options for selection
  const workPackageOptions: [string, WorkPackageCardModel[]][] = [
    [`Upcoming Work Packages (${upcomingWPs.length})`, upcomingWPs],
    [`In Progress Work Packages (${inProgressWPs.length})`, inProgressWPs],
    [`Overdue Work Packages (${overdueWPs.length})`, overdueWPs]
  ];

  let defaultFirstDisplay = 2;
  if (workPackageOptions[2][1].length === 0) {
    defaultFirstDisplay = 1;
    if (workPackageOptions[1][1].length === 0) {
      defaultFirstDisplay = 0;
    }
  }

  // undefined until the user picks one, so the default can be based on loaded data
  const [selectedOption, setSelectedOption] = useState<number>();
  const currentDisplayedWPs = selectedOption ?? defaultFirstDisplay;

  if (upcomingIsError) return <ErrorPage message={upcomingError.message} />;
  if (inProgressIsError) return <ErrorPage message={inProgressError.message} />;
  if (overdueIsError) return <ErrorPage message={overdueError.message} />;
  if (upcomingIsLoading || inProgressIsLoading || overdueIsLoading) return <LoadingIndicator />;

  // destructuring tuple to get wps of selected option
  const [, currentWps] = workPackageOptions[currentDisplayedWPs];

  const WorkPackagesDisplay = (workPackages: WorkPackageCardModel[]) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
        flexShrink: 0,
        width: '100%',
        gap: 2
      }}
    >
      {workPackages.map((wp) => (
        <WorkPackageCard key={wp.id} wp={wp} />
      ))}
    </Box>
  );

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
          options={workPackageOptions.map((wp) => wp[0])}
          onSelect={setSelectedOption}
          selected={currentDisplayedWPs}
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
          {currentWps.length === 0 ? <NoWorkPackages /> : WorkPackagesDisplay(currentWps)}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WorkPackagesSelectionView;
