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

const StatisticsPage: React.FC = () => {
  const { data: graphCollections, isLoading, isError, error } = useGetAllGraphCollections();
  const [showCreateGraphCollectionModal, setShowCreateGraphCollectionModal] = useState(false);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (!graphCollections || isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <PageLayout title="Statistics">
      <Box>
        <Typography variant="h5">Graph Collections</Typography>
        <Grid container mt={1} spacing={1}>
          {graphCollections.map((graphCollection) => {
            return (
              <Grid item xs={12} md={6} lg={4}>
                <GraphCollectionCard graphCollection={graphCollection} />
              </Grid>
            );
          })}
          <Grid item lg={4} md={6} xs={12}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '2px dashed #ef4343'
              }}
            >
              <NERButton onClick={() => setShowCreateGraphCollectionModal(true)}>Create Graph Collection</NERButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <CreateGraphCollectionForm
        open={showCreateGraphCollectionModal}
        onHide={() => setShowCreateGraphCollectionModal(false)}
      />
    </PageLayout>
  );
};

export default StatisticsPage;
