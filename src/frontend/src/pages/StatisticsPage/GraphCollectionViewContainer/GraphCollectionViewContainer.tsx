import { useHistory, useParams } from 'react-router-dom';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { Box, Grid } from '@mui/material';
import GraphView from '../GraphView/GraphView';
import { useGetSingleGraphCollection } from '../../../hooks/statistics.hooks';
import { NERButton } from '../../../components/NERButton';
import { routes } from '../../../utils/routes';
import PageLayout from '../../../components/PageLayout';
import UpdateGraphCollectionForm from '../GraphCollectionForm/UpdateGraphCollectionForm';
import { useState } from 'react';

const GraphCollectionViewContainer = () => {
  const { graphCollectionId } = useParams<{ graphCollectionId: string }>();
  const { data: graphCollection, isLoading, isError, error } = useGetSingleGraphCollection(graphCollectionId);
  const history = useHistory();
  const [showEditGraphCollectionModal, setShowEditGraphCollectionModal] = useState(false);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (isLoading || !graphCollection) {
    return <LoadingIndicator />;
  }

  return (
    <PageLayout
      stickyHeader
      title={graphCollection.title}
      previousPages={[{ name: 'Statistics', route: routes.STATISTICS }]}
      headerRight={
        <Box display="inline-flex" alignItems="center" justifyContent={'end'}>
          <NERButton variant="contained" sx={{ mx: 1 }} onClick={() => setShowEditGraphCollectionModal(true)}>
            Edit Graph Collection
          </NERButton>
        </Box>
      }
    >
      <Grid container spacing={1}>
        {graphCollection.graphs.map((graph) => (
          <Grid item lg={4} md={6} xs={12} overflow={'hidden'}>
            <GraphView graph={graph} height={400} />
          </Grid>
        ))}
        <Grid item lg={4} md={6} xs={12}>
          <Box
            sx={{
              width: '100%',
              height: 400,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px dashed #ef4343'
            }}
          >
            <NERButton
              onClick={() => history.push(`${routes.STATISTICS}/graph-collections/${graphCollection.id}/graph/create`)}
            >
              Add Graph
            </NERButton>
          </Box>
        </Grid>
      </Grid>
      <UpdateGraphCollectionForm
        open={showEditGraphCollectionModal}
        onHide={() => setShowEditGraphCollectionModal(false)}
        graphCollection={graphCollection}
      />
    </PageLayout>
  );
};

export default GraphCollectionViewContainer;
