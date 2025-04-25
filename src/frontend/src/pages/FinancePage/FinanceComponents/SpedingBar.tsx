import { Box } from '@mui/material';
import {
  BarControllerChartOptions,
  CoreChartOptions,
  DatasetChartOptions,
  ElementChartOptions,
  PluginChartOptions,
  ScaleChartOptions,
  Chart
} from 'chart.js';
import { _DeepPartialObject } from 'chart.js/dist/types/utils';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface SpendingChartData {
  value: number;
  label: string;
  color: string;
}

export const sampleData = [
  {
    value: 2500,
    label: 'Segments',
    color: 'red'
  },
  {
    value: 5000,
    label: 'Shepherd',
    color: 'blue'
  },
  {
    value: 0,
    label: 'Flex PCB',
    color: 'green'
  }
];

const SpendingBar = ({ data, title }: { title: string; data: SpendingChartData[] }) => {
  Chart.register(ChartDataLabels);

  let average = data.reduce((prev, curr) => prev + curr.value, 0) / data.length;
  average = average === 0 ? 20 : average;

  const barData = {
    labels: ['Electrical Powertrain'],
    datasets: data.map((val) => ({
      label: val.label,
      data: [val.value + average],
      backgroundColor: val.color,
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0)'
    }))
  };

  const config: _DeepPartialObject<
    CoreChartOptions<'bar'> &
      ElementChartOptions<'bar'> &
      PluginChartOptions<'bar'> &
      DatasetChartOptions<'bar'> &
      ScaleChartOptions<'bar'> &
      BarControllerChartOptions
  > = {
    indexAxis: 'y',
    plugins: {
      title: {
        display: false,
        text: title
      },
      legend: {
        display: false
      },
      datalabels: {
        display: true,
        color: 'white',
        anchor: 'center',
        align: 'center',
        textAlign: 'center',
        formatter: (value, context) => {
          const realValue = value - average;
          const { label } = context.dataset;
          return [label, `$${realValue}`];
        }
      }
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
        ticks: {
          display: false
        }
      },
      y: {
        stacked: true,
        ticks: {
          display: false
        }
      }
    }
  };

  return (
    <Box>
      <Bar data={barData} options={config} />
    </Box>
  );
};

export default SpendingBar;
