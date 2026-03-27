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
  ChartOptions
} from 'chart.js';
import { Box } from '@mui/material';

Chart.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);

interface BarChartDataset {
  yAxisData: number[];
  yAxisLabel: string;
  color: string;
}

interface StatsBarChartProps {
  xAxisData: string[];
  xAxisLabel: string;
  datasets: BarChartDataset[];
  timeFrame?: string;
  width?: number;
  height?: number;
  graphTitle: string;
}

const StatsBarChart: React.FC<StatsBarChartProps> = ({
  xAxisLabel,
  xAxisData,
  datasets,
  width = 600,
  height = 400,
  graphTitle
}) => {
  const data = {
    labels: xAxisData,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.yAxisLabel,
      data: dataset.yAxisData,
      backgroundColor: dataset.color,
      order: datasets.length - index,
      categoryPercentage: 1 / (index + 1)
    }))
  };

  const options: ChartOptions<'bar'> = {
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
        stacked: true,
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
    <Box sx={{ height, width, maxWidth: '100%', maxHeight: '100%' }}>
      <Bar data={data} options={options} />
    </Box>
  );
};

export default StatsBarChart;
