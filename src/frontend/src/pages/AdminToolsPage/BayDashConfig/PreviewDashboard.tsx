/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetCurrentBayDashboardConfig } from '../../../hooks/bay-dashboard.hooks';
import { defaultBayDashboardSlots } from '../../../utils/bay-dashboard.utils';
import ErrorPage from '../../ErrorPage';
import BayDashboardGrid from '../../BayDashboardPage/components/BayDashboardGrid';

/**
 * Scaled down copy of what the TV in the bay is currently displaying.
 */
const PreviewDashboard: React.FC = () => {
  const { data: config, isLoading, isError, error } = useGetCurrentBayDashboardConfig();

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || config === undefined) return <LoadingIndicator />;

  return (
    <Box sx={{ border: '3px solid white' }}>
      <BayDashboardGrid slots={config?.slots ?? defaultBayDashboardSlots} />
    </Box>
  );
};

export default PreviewDashboard;
