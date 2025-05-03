import { Box, Typography } from '@mui/material';
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
import { ReimbursementRequestData, SpendingBarData } from 'shared';
import { grey } from '@mui/material/colors';
import { useEffect, useRef, useState } from 'react';

export const sampleData: { title: string; spendingInfo: ReimbursementRequestData }[] = [
  {
    title: 'Segments',
    spendingInfo: {
      totalBudget: 5000,
      pendingFinance: 1500,
      reimbursed: 3000,
      pendingLeadership: 0,
      submittedToSabo: 250,
      available: 250
    }
  },
  {
    title: 'Shepherd',
    spendingInfo: {
      totalBudget: 2000,
      pendingFinance: 1500,
      reimbursed: 400,
      pendingLeadership: 0,
      submittedToSabo: 250,
      available: 250
    }
  },
  {
    title: 'Flex PCB',
    spendingInfo: {
      totalBudget: 0,
      pendingFinance: 0,
      reimbursed: 0,
      pendingLeadership: 0,
      submittedToSabo: 0,
      available: 0
    }
  }
];

const getTotalMoneySpent = (data: ReimbursementRequestData) =>
  data.available + data.pendingFinance + data.pendingLeadership + data.reimbursed + data.submittedToSabo;

const transformReimbursementDataToBarData = (title: string, average: number, data: ReimbursementRequestData) =>
  getBarData(title, getTotalMoneySpent(data) + average, getTotalMoneySpent(data) === 0 ? grey[500] : grey[800]);

const getBarData = (title: string, value: number, color: string) => ({
  label: title,
  data: [value],
  backgroundColor: color,
  borderWidth: 5,
  borderColor: 'rgba(255, 255, 255, 0)'
});

const SpendingBar = ({ data, title }: SpendingBarData) => {
  Chart.register(ChartDataLabels);
  const chartRef = useRef<HTMLElement | null>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);

  let average = Math.floor(data.reduce((prev, curr) => prev + getTotalMoneySpent(curr.spendingInfo), 0) / data.length);
  average = average === 0 ? 1 : average;

  const [barData, setBarData] = useState({
    labels: [title],
    datasets: data.map((val) => transformReimbursementDataToBarData(val.title, average, val.spendingInfo))
  });

  useEffect(() => {
    const handleClick = (event: any) => {
      if (chartRef.current && !chartRef.current.contains(event.target)) {
        setHoveredIndex(undefined);
        setBarData((prev) => ({
          ...prev,
          datasets: data.map((val) => transformReimbursementDataToBarData(val.title, average, val.spendingInfo))
        }));
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [average, setBarData, data]);

  useEffect(() => {
    if (hoveredIndex !== undefined) {
      setBarData((prev) => ({
        ...prev,
        datasets: data.flatMap((val, index) => {
          if (index === hoveredIndex) {
            return [
              getBarData('Leadership', val.spendingInfo.pendingLeadership + average, '#ef2020'),
              getBarData('Finance', val.spendingInfo.pendingFinance + average, '#ef4545'),
              getBarData('SABO', val.spendingInfo.submittedToSabo + average, '#efA0A0'),
              getBarData('Reimbursed', val.spendingInfo.reimbursed + average, grey[800]),
              getBarData('Available', val.spendingInfo.available + average, grey[500])
            ];
          }
          return transformReimbursementDataToBarData(val.title, average, val.spendingInfo);
        })
      }));
    }
  }, [hoveredIndex, average, setBarData, data]);

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
        color: (context) => {
          let { datasetIndex } = context;
          if (hoveredIndex !== undefined && datasetIndex >= hoveredIndex) {
            datasetIndex -= Math.min(datasetIndex - hoveredIndex, 4);
          }
          const dataset = data[datasetIndex];

          if (datasetIndex !== hoveredIndex && dataset.spendingInfo.totalBudget < getTotalMoneySpent(dataset.spendingInfo)) {
            return '#ef4545';
          }
          return 'white';
        },
        anchor: 'center',
        align: 'center',
        textAlign: 'center',
        formatter: (value, context) => {
          const realValue = value - average;
          const { label } = context.dataset;
          return [label, `$${realValue}`];
        }
      },
      tooltip: {
        displayColors: false,
        backgroundColor: (context) => {
          let [{ datasetIndex }] = context.tooltip.dataPoints;

          if (hoveredIndex !== undefined && datasetIndex >= hoveredIndex) {
            datasetIndex -= Math.min(datasetIndex - hoveredIndex, 4);
          }

          const dataset = data[datasetIndex];

          if (dataset.spendingInfo.totalBudget < getTotalMoneySpent(dataset.spendingInfo)) {
            return '#ef4545';
          }
          return undefined;
        },
        callbacks: {
          label: (context) => {
            let { datasetIndex } = context;
            if (hoveredIndex !== undefined && datasetIndex >= hoveredIndex) {
              datasetIndex -= Math.min(datasetIndex - hoveredIndex, 4);
            }
            const dataset = data[datasetIndex];

            const title = context.dataset.label;

            const value = context.parsed.x - average; // for horizontal bar, use .x — use .y for vertical

            if (dataset.spendingInfo.totalBudget < getTotalMoneySpent(dataset.spendingInfo)) {
              return `Spending is $${getTotalMoneySpent(dataset.spendingInfo) - dataset.spendingInfo.totalBudget} overbudget!`;
            }

            return `${title}: ${value}`;
          },
          title: (tooltipItems) => {
            let [{ datasetIndex }] = tooltipItems;

            if (hoveredIndex !== undefined && datasetIndex >= hoveredIndex) {
              datasetIndex -= Math.min(datasetIndex - hoveredIndex, 4);
            }
            const dataset = data[datasetIndex];

            if (dataset.spendingInfo.totalBudget < getTotalMoneySpent(dataset.spendingInfo)) {
              return [];
            }
            return dataset.title;
          }
        }
      }
    },
    onClick: (_event, chartElements) => {
      if (chartElements.length > 0) {
        let [{ datasetIndex }] = chartElements;
        if (hoveredIndex !== undefined) {
          if (datasetIndex > hoveredIndex) {
            datasetIndex -= Math.min(datasetIndex - hoveredIndex, 4);
          }
          setHoveredIndex(undefined);
        }

        if (datasetIndex >= 0) {
          setHoveredIndex(datasetIndex);
        }
      }
    },
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
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
    <>
      <Typography fontWeight={'bold'} variant="h6">
        {title}
      </Typography>
      <Box ref={chartRef} height={100}>
        <Bar data={barData} options={config} />
      </Box>
    </>
  );
};

export default SpendingBar;
