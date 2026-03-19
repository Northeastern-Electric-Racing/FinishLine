import { useHistory, useParams } from 'react-router-dom';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { Box } from '@mui/material';
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
          <NERButton
            variant="outlined"
            sx={{ mx: 1 }}
            onClick={() => history.push(`${routes.STATISTICS}/graph-collections/${graphCollection.id}/graph/create`)}
          >
            Add Graph
          </NERButton>
        </Box>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start'
        }}
      >
        {graphCollection.graphs.map((graph) => (
          <Box
            key={graph.graphId}
            sx={{
              flex: '0 0 auto',
              minWidth: 300,
              minHeight: 200
            }}
          >
            <GraphView graph={graph} height={400} width={600} />
          </Box>
        ))}
      </Box>

      <UpdateGraphCollectionForm
        open={showEditGraphCollectionModal}
        onHide={() => setShowEditGraphCollectionModal(false)}
        graphCollection={graphCollection}
      />
    </PageLayout>
  );
};

export default GraphCollectionViewContainer;
