import { Graph } from 'shared';
import StatsPieChart from '../../../components/StatsPieChart';

interface GraphPieChartViewProps {
  graph: Graph;
}

const GraphPieChartView = ({ graph }: GraphPieChartViewProps) => {
  return (
    <StatsPieChart
      graphTitle={graph.title}
      xAxisData={graph.graphData.map((data) => data.label)}
      yAxisData={graph.graphData.map((data) => data.value)}
    />
  );
};

export default GraphPieChartView;
