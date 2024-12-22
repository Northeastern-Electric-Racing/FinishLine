import { Box, IconButton, Typography } from '@mui/material';
import { Graph, GraphDisplayType } from 'shared';
import GraphBarChartView from './GraphBarChartView';
import GraphPieChartView from './GraphPieChartView';
import { Edit } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

interface GraphViewProps {
  graph: Graph;
}

const GraphView = ({ graph }: GraphViewProps) => {
  const history = useHistory();

  const Graph = () => {
    switch (graph.graphDisplayType) {
      case GraphDisplayType.BAR:
        return <GraphBarChartView graph={graph} />;
      case GraphDisplayType.PIE:
        return <GraphPieChartView graph={graph} />;
      default:
        return <Typography>Unsupported graph display type: {graph.graphDisplayType}</Typography>;
    }
  };

  return (
    <Box display={'flex'} alignItems={'top'}>
      <Graph />
      <IconButton onClick={() => history.push('/statistics/graph/' + graph.graphId)}>
        <Edit />
      </IconButton>
    </Box>
  );
};

export default GraphView;
