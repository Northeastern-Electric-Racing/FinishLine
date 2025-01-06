import { Car, Graph } from 'shared';
import StatsBarChart from '../../../components/StatsBarChart';
import { displayEnum } from '../../../utils/pipes';
interface GraphBarChartViewProps {
  graph: Graph;
  height: number;
  cars: Car[];
}

const GraphBarChartView = ({ graph, height, cars }: GraphBarChartViewProps) => {
  return (
    <StatsBarChart
      graphTitle={`${displayEnum(graph.measure)} ${graph.title} - ${displayEnum(graph.graphType)} ${
        cars.length > 0 ? `(${cars.map((car) => car.name).join(',')})` : ''
      }`}
      xAxisData={graph.graphData.map((data) => data.label)}
      yAxisData={graph.graphData.map((data) => data.value)}
      xAxisLabel={graph.xAxisLabel}
      yAxisLabel={graph.yAxisLabel}
      height={height}
    />
  );
};

export default GraphBarChartView;
