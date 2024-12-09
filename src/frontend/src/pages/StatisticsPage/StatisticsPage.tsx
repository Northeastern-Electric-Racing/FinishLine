/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageLayout from '../../components/PageLayout';
import { useGraphConfig } from '../../hooks/statistics.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Box } from '@mui/material';

const StatisticsPage: React.FC = () => {
  const { data, isLoading, isError, error } = useGraphConfig();

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (!data || isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <PageLayout title="Statistics">
      {/* Add your frontend components here to check them */}
      <Box>
      </Box>
    </PageLayout>
  );
};

export default StatisticsPage;
