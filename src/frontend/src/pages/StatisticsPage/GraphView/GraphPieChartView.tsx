import { Car, Graph } from 'shared';
import StatsPieChart from '../../../components/StatsPieChart';
import { displayEnum } from '../../../utils/pipes';

interface GraphPieChartViewProps {
  graph: Graph;
  height: number;
  cars: Car[];
}

const GraphPieChartView = ({ graph, height, cars }: GraphPieChartViewProps) => {
  return (
    <StatsPieChart
      graphTitle={`${graph.title} - ${displayEnum(graph.graphType)} ${
        cars.length > 0 ? `(${cars.map((car) => car.name).join(',')})` : ''
      }`}
      xAxisData={graph.graphData.map((data) => data.label)}
      yAxisData={graph.graphData.map((data) => data.value)}
      height={height}
    />
  );
};

export default GraphPieChartView;
