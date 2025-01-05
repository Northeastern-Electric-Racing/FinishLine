import { Pie } from 'react-chartjs-2';
import {
  Chart,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  CoreChartOptions,
  ElementChartOptions,
  PluginChartOptions,
  DatasetChartOptions,
  ScaleChartOptions,
  BarControllerChartOptions
} from 'chart.js';
import { Box } from '@mui/material';
import { _DeepPartialObject } from 'chart.js/dist/types/utils';

Chart.register(ArcElement, Title, Tooltip, Legend);

interface StatsPieChartProps {
  xAxisData: string[];
  yAxisData: number[];
  timeFrame?: string;
  width?: number;
  height?: number;
  graphTitle: string;
}

const StatsPieChart: React.FC<StatsPieChartProps> = ({ xAxisData, yAxisData, width = 600, height = 400, graphTitle }) => {
  const data = {
    labels: xAxisData,
    datasets: [
      {
        data: yAxisData,
        backgroundColor: [
          '#DE514C',
          '#5471D1',
          '#FFCE56',
          '#54D162',
          '#4BC0C0',
          '#FF9F40',
          '#FF6384',
          '#9966FF',
          '#8c0f0f',
          '#A97D4E',
          '#2A751B',
          '#B0387C'
        ],
        hoverBackgroundColor: [
          '#EB6C67',
          '#667FD1',
          '#FAD784',
          '#79D483',
          '#53D7DB',
          '#F7A859',
          '#FA7C9A',
          '#A881F7',
          '#9A3C3C',
          '#C6A37A',
          '#3A8F2E',
          '#C657A3'
        ]
      }
    ]
  };

  const options: _DeepPartialObject<
    CoreChartOptions<'pie'> &
      ElementChartOptions<'pie'> &
      PluginChartOptions<'pie'> &
      DatasetChartOptions<'pie'> &
      ScaleChartOptions<'pie'> &
      BarControllerChartOptions
  > = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: graphTitle,
        font: {
          size: 18
        },
        color: 'white'
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 14
          },
          color: 'white'
        }
      }
    }
  };

  return (
    <Box style={{ height, width: '100%', maxWidth: width }}>
      <Pie data={data} options={options} />
    </Box>
  );
};

export default StatsPieChart;
