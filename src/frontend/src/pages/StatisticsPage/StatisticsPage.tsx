/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Grid, Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import GraphCollectionCard from '../../components/GraphCollectionCard';
import { useGetAllGraphCollections } from '../../hooks/statistics.hooks';
import { NERButton } from '../../components/NERButton';
import CreateGraphCollectionForm from './GraphCollectionForm/CreateGraphCollectionForm';
import { useState } from 'react';
import BarChart from '../../components/StatsBarChart';
import PieChart from '../../components/StatsPieChart';
import LineGraph from '../../components/StatsLineGraph';

const StatisticsPage: React.FC = () => {
  const { data: graphCollections, isLoading, isError, error } = useGetAllGraphCollections();
  // const [showCreateGraphCollectionModal, setShowCreateGraphCollectionModal] = useState(false);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  // if (!graphCollections || isLoading) {
  //   return <LoadingIndicator />;
  // }

  return (
    <PageLayout
      title="Statistics"
      // headerRight={<NERButton onClick={() => setShowCreateGraphCollectionModal(true)}>Create Graph Collection</NERButton>}
    >
      {/* <Box>
        <Typography variant="h5">Graph Collections</Typography>
        <Grid container mt={1} spacing={1}>
          {graphCollections.map((graphCollection) => {
            return (
              <Grid item xs={3}>
                <GraphCollectionCard graphCollection={graphCollection} />
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <CreateGraphCollectionForm
        open={showCreateGraphCollectionModal}
        onHide={() => setShowCreateGraphCollectionModal(false)}
      /> */}

      <Box style={{ display: 'flex', justifyContent: 'normal' }}>
        <BarChart
          xAxisData={['test1', 'test2', 'test3', 'test4']}
          yAxisData={[100, 200, 50, 300]}
          xAxisLabel="Categories"
          yAxisLabel="Values"
          graphTitle="Bar Chart Test"
        />

        <Box style={{ padding: '50px' }} />

        <PieChart
          xAxisData={[
            'test1',
            'test2',
            'test3',
            'test4',
            'test5',
            'test6',
            'test7',
            'test8',
            'test9',
            'test10',
            'test11',
            'test12'
          ]}
          yAxisData={[10, 20, 5, 35, 15, 25, 10, 20, 5, 10, 12, 20]}
          graphTitle="Pie Chart Test"
        />
      </Box>

      <Box style={{ display: 'flex', justifyContent: 'normal' }}>
        <LineGraph
          xAxisData={['test1', 'test2', 'test3', 'test4']}
          yAxisData={[100, 200, 50, 500]}
          xAxisLabel="Categories"
          yAxisLabel="Values"
          graphTitle="Line graph Test"
        />
      </Box>
    </PageLayout>
  );
};

export default StatisticsPage;
