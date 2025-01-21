import { Card, CardContent, Grid, IconButton, Link, Typography } from '@mui/material';
import { GraphCollection } from 'shared';
import { datePipe, displayEnum, fullNamePipe } from '../utils/pipes';
import { Link as RouterLink } from 'react-router-dom';
import { Construction, Delete } from '@mui/icons-material';
import { DateRangeIcon } from '@mui/x-date-pickers';
import LoadingIndicator from './LoadingIndicator';
import { useDeleteGraphCollection } from '../hooks/statistics.hooks';
import { useToast } from '../hooks/toasts.hooks';

interface GraphCollectionCardProps {
  graphCollection: GraphCollection;
}

const GraphCollectionCard = ({ graphCollection }: GraphCollectionCardProps) => {
  const { isLoading: removeGraphCollectionIsLoading, mutateAsync: removeGraphCollection } = useDeleteGraphCollection(
    graphCollection.id
  );
  const toast = useToast();

  if (removeGraphCollectionIsLoading) {
    return <LoadingIndicator />;
  }

  const onDeletePressed = async () => {
    try {
      await removeGraphCollection();
      toast.success('Successfully deleted collection');
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to delete collection' + error.message);
      }
    }
  };

  return (
    <Card sx={{ width: '100%', borderRadius: 5, position: 'relative' }}>
      <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={onDeletePressed}>
        <Delete />
      </IconButton>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Link component={RouterLink} to={`/statistics/graph-collections/${graphCollection.id}`}>
              <Typography variant="h5">{graphCollection.title}</Typography>
            </Link>
          </Grid>
          <Grid item display="flex" xs={6}>
            <Construction sx={{ mr: 1 }} /> <Typography>{fullNamePipe(graphCollection.userCreated)}</Typography>
          </Grid>
          <Grid item display="flex" xs={6}>
            <DateRangeIcon sx={{ mr: 1 }} /> <Typography>{datePipe(graphCollection.dateCreated)}</Typography>
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs={12}>
              <Typography variant="h6">Graphs: </Typography>
            </Grid>
            {graphCollection.graphs.map((graph) => (
              <Grid item xs={12}>
                <Typography variant="body1">{`${graph.title} - ${displayEnum(graph.graphType)} (${
                  graph.measure
                })`}</Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GraphCollectionCard;
