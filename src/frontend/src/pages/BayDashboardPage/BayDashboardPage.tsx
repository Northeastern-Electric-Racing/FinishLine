/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useBayDashboardEvents, useGetBayDashboardConfig } from '../../hooks/bay-dashboard.hooks';
import { defaultBayDashboardSlots } from '../../utils/bay-dashboard.utils';
import ErrorPage from '../ErrorPage';
import BayDashboardGrid from './components/BayDashboardGrid';

interface ParamTypes {
  slug: string;
}

/**
 * The public bay dashboard, displayed on the TV in the bay.
 */
const BayDashboardPage: React.FC = () => {
  const { slug } = useParams<ParamTypes>();

  useBayDashboardEvents(slug);
  const { data: config, isLoading, isError, error } = useGetBayDashboardConfig(slug);

  // a failed refetch keeps the last config that loaded, so only show the error when there's nothing to display
  if (isError && config === undefined) return <ErrorPage message={error.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        bgcolor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box sx={{ width: 'min(100vw, calc(100vh * 16 / 9))' }}>
        <BayDashboardGrid slots={config?.slots ?? defaultBayDashboardSlots} />
      </Box>
    </Box>
  );
};

export default BayDashboardPage;
