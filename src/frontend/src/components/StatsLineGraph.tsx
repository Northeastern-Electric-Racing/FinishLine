import { Line } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
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

Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Title, Tooltip, Legend);

interface StatsLineGraphProps {
  xAxisData: string[];
  yAxisData: number[];
  xAxisLabel: string;
  yAxisLabel: string;
  timeFrame?: string;
  width?: number;
  height?: number;
  graphTitle: string;
}

const StatsLineGraph: React.FC<StatsLineGraphProps> = ({
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
        backgroundColor: '#DE514C',
        borderColor: '#DE514C'
      }
    ]
  };

  const options: _DeepPartialObject<
    CoreChartOptions<'line'> &
      ElementChartOptions<'line'> &
      PluginChartOptions<'line'> &
      DatasetChartOptions<'line'> &
      ScaleChartOptions<'line'> &
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
        },
        min: 0
      }
    }
  };

  return (
    <Box sx={{ height, width: '100%', maxWidth: width }}>
      <Line data={data} options={options} />
    </Box>
  );
};

export default StatsLineGraph;
