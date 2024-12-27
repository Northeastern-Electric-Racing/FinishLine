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
  Legend
} from 'chart.js';
import { Box } from '@mui/material';

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

  const options = {
    responsive: true,
    maintainAspectRatio: true,
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
        position: 'top' as const,
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
    <Box sx={{ width: '100%', height: '100%', maxWidth: width, maxHeight: height }}>
      <Line data={data} options={options} />
    </Box>
  );
};

export default StatsLineGraph;
