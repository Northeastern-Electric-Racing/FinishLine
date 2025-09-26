import React from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import OverdueWorkPackagesView from './OverdueWorkPackageView';
import { useHomeScreenWorkPackages } from '../../../hooks/work-packages.hooks';
import { useTheme } from '@mui/material';

const OverdueWorkPackages: React.FC<{}> = () => {
  const theme = useTheme();
  const { data: overdueWPs, isLoading, isError, error } = useHomeScreenWorkPackages('allOverdue');

  if (isLoading || !overdueWPs) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  console.log('Overdue WPs:', overdueWPs);

  return <OverdueWorkPackagesView theme={theme} workPackages={overdueWPs} />;
};

export default OverdueWorkPackages;
