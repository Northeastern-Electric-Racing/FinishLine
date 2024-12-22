import { Graph } from 'shared';
import StatsBarChart from '../../../components/StatsBarChart';
import { displayEnum } from '../../../utils/pipes';

interface GraphBarChartViewProps {
  graph: Graph;
}

const GraphBarChartView = ({ graph }: GraphBarChartViewProps) => {
  return (
    <StatsBarChart
      graphTitle={graph.title}
      xAxisData={graph.graphData.map((data) => data.label)}
      yAxisData={graph.graphData.map((data) => data.value)}
      xAxisLabel={displayEnum(graph.graphType)}
      yAxisLabel="Value"
    />
  );
};

export default GraphBarChartView;
