import { Bar } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CoreChartOptions,
  ElementChartOptions,
  DatasetChartOptions,
  PluginChartOptions,
  BarControllerChartOptions,
  ScaleChartOptions
} from 'chart.js';
import { Box } from '@mui/material';
import { _DeepPartialObject } from 'chart.js/dist/types/utils';

Chart.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);

interface StatsBarChartProps {
  xAxisData: string[];
  yAxisData: number[];
  xAxisLabel: string;
  yAxisLabel: string;
  timeFrame?: string;
  width?: number;
  height?: number;
  graphTitle: string;
}

const StatsBarChart: React.FC<StatsBarChartProps> = ({
  xAxisData,
  yAxisData,
  xAxisLabel,
  yAxisLabel,
  width = 600,
  height = 400,
  graphTitle
}) => {
  const data = {
    labels: xAxisData,
    datasets: [
      {
        label: yAxisLabel,
        data: yAxisData,
        backgroundColor: '#DE514C'
      }
    ]
  };

  const options: _DeepPartialObject<
    CoreChartOptions<'bar'> &
      ElementChartOptions<'bar'> &
      PluginChartOptions<'bar'> &
      DatasetChartOptions<'bar'> &
      ScaleChartOptions<'bar'> &
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
        display: false,
        position: 'bottom',
        labels: {
          font: {
            size: 14
          },
          color: 'white'
        }
      }
    },

    scales: {
      x: {
        title: {
          display: true,
          text: xAxisLabel,
          font: {
            size: 14
          },
          color: 'white'
        },
        ticks: {
          color: 'white'
        }
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
          font: {
            size: 14
          },
          color: 'white'
        },
        ticks: {
          color: 'white'
        },
        grid: {
          color: '#6A6B6B'
        }
      }
    }
  };

  return (
    <Box sx={{ height, width: '100%', maxWidth: width }}>
      <Bar data={data} options={options} />
    </Box>
  );
};

export default StatsBarChart;
