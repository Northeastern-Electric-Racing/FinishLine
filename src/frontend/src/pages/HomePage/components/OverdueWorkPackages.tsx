import React, { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import OverdueWorkPackagesView from './OverdueWorkPackageView';
import { useHomeScreenWorkPackages } from '../../../hooks/work-packages.hooks';
import { useTheme } from '@mui/material';
import { dateToMidnightUTC, WorkPackageSelection } from 'shared';

const OverdueWorkPackages: React.FC<{}> = () => {
  const theme = useTheme();
  // the user's calendar day, in the same midnight-UTC form work package dates are stored in
  const [today] = useState(() => dateToMidnightUTC(new Date()));
  const {
    data: overdueWPs,
    isLoading,
    isError,
    error
  } = useHomeScreenWorkPackages(WorkPackageSelection.ALL, {
    endsBefore: today
  });

  if (isError) return <ErrorPage error={error} message={error.message} />;
  if (isLoading || !overdueWPs) return <LoadingIndicator />;

  return <OverdueWorkPackagesView theme={theme} workPackages={overdueWPs} />;
};

export default OverdueWorkPackages;
