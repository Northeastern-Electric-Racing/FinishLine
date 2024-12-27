import { Card, CardContent, Grid, Link, Typography } from '@mui/material';
import { GraphCollection } from 'shared';
import { displayEnum } from '../utils/pipes';
import { Link as RouterLink } from 'react-router-dom';

interface GraphCollectionCardProps {
  graphCollection: GraphCollection;
}

const GraphCollectionCard = ({ graphCollection }: GraphCollectionCardProps) => {
  return (
    <Card sx={{ width: '300px' }}>
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            <Link component={RouterLink} to={`/statistics/graph-collections/${graphCollection.id}`}>
              <Typography variant="h5">{graphCollection.title}</Typography>
            </Link>
          </Grid>
          {graphCollection.graphs.map((graph) => (
            <Grid item xs={6}>
              <Typography variant="body1">{displayEnum(graph.graphType)}</Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GraphCollectionCard;
