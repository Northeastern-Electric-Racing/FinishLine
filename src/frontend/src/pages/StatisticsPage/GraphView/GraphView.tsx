import { Box, IconButton, Typography } from '@mui/material';
import { Graph, GraphDisplayType } from 'shared';
import GraphBarChartView from './GraphBarChartView';
import GraphPieChartView from './GraphPieChartView';
import { Edit } from '@mui/icons-material';
import { useHistory, useParams } from 'react-router-dom';
import { datePipe } from '../../../utils/pipes';
import { useGetCarsByIds } from '../../../hooks/cars.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface GraphViewProps {
  graph: Graph;
  height: number;
}

const GraphView = ({ graph, height = 500 }: GraphViewProps) => {
  const history = useHistory();
  const { graphCollectionId } = useParams<{ graphCollectionId: string }>();
  const { isLoading, data: cars, error, isError } = useGetCarsByIds(new Set(graph.carIds));

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (isLoading || !cars) {
    return <LoadingIndicator />;
  }

  const Graph = () => {
    switch (graph.graphDisplayType) {
      case GraphDisplayType.BAR:
        return <GraphBarChartView graph={graph} height={height} cars={cars} />;
      case GraphDisplayType.PIE:
        return <GraphPieChartView graph={graph} height={height} cars={cars} />;
      default:
        return <Typography>Unsupported graph display type: {graph.graphDisplayType}</Typography>;
    }
  };

  return (
    <Box justifyContent={'center'}>
      <Box display={'flex'}>
        <Graph />
        <IconButton sx={{ height: 40}}
          onClick={() =>
            history.push('/statistics/graph-collections/' + graphCollectionId + '/graph/' + graph.graphId + '/edit')
          }
        >
          <Edit />
        </IconButton>
      </Box>
      <Typography textAlign={'center'} fontWeight={'regular'} fontSize={20} variant="h6" noWrap>
        {!graph.startDate && !graph.endDate
          ? 'All time'
          : (graph.startDate ? datePipe(graph.startDate) : 'No start date') +
            ' to ' +
            (graph.endDate ? datePipe(graph.endDate) : 'no end date')}
      </Typography>
    </Box>
  );
};

export default GraphView;
