import React from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import OverdueWorkPackagesView from './OverdueWorkPackageView';
import { useHomeScreenWorkPackages } from '../../../hooks/work-packages.hooks';
import { useTheme } from '@mui/material';
import { WorkPackageSelection } from 'shared';

const OverdueWorkPackages: React.FC<{}> = () => {
  const theme = useTheme();
  const { data: overdueWPs, isLoading, isError, error } = useHomeScreenWorkPackages(WorkPackageSelection.ALL_OVERDUE);

  if (isLoading || !overdueWPs) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return <OverdueWorkPackagesView theme={theme} workPackages={overdueWPs} />;
};

export default OverdueWorkPackages;
