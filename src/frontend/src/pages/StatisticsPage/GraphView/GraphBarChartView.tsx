import { Car, Graph } from 'shared';
import StatsBarChart from '../../../components/StatsBarChart';
import { displayEnum } from '../../../utils/pipes';
interface GraphBarChartViewProps {
  graph: Graph;
  height: number;
  cars: Car[];
}

const colors = ['#DE1515', '#1515DE', '#15DE15'];

const GraphBarChartView = ({ graph, height, cars }: GraphBarChartViewProps) => {
  return (
    <StatsBarChart
      graphTitle={`${displayEnum(graph.measure)} ${graph.title} - ${displayEnum(graph.graphType)} ${
        cars.length > 0 ? `(${cars.map((car) => car.name).join(',')})` : ''
      }`}
      datasets={graph.graphData.map((data, index) => ({
        yAxisData: data.values.map((data) => data.value),
        yAxisLabel: data.tipLabel,
        color: colors[index]
      }))}
      xAxisData={graph.graphData[0].values.map((data) => data.label)}
      xAxisLabel={graph.xAxisLabel}
      height={height}
    />
  );
};

export default GraphBarChartView;
