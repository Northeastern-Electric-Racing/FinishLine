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

const getTotalMoneySpent = (data: ReimbursementRequestData) =>
  data.available + data.pendingFinance + data.pendingLeadership + data.reimbursed + data.submittedToSabo;

const transformReimbursementDataToBarData = (
  title: string,
  average: number,
  data: ReimbursementRequestData,
  dataLength: number
) =>
  getBarData(title, getTotalMoneySpent(data) + average, getTotalMoneySpent(data) === 0 ? grey[500] : grey[800], dataLength);

const getBarData = (title: string, value: number, color: string, dataLength: number) => ({
  label: title,
  data: [value],
  backgroundColor: color,
  borderWidth: 2,
  categoryPercentage: 1.0,
  barThickness: 'flex' as any,
  stack: 'stack',
  barPercentage: 1.0,
  borderColor: 'rgba(255, 255, 255, 0)',
  borderRadius: (context: any): any => {
    const { datasetIndex } = context;
    const isFirst = datasetIndex === 0;
    const isLast = datasetIndex === dataLength - 1;

    const object = {
      topLeft: isFirst ? 10 : 0,
      bottomLeft: isFirst ? 10 : 0,
      topRight: isLast ? 10 : 0,
      bottomRight: isLast ? 10 : 0
    };
    return object;
  },
  borderSkipped: false
});

const SpendingBar = ({ data, title }: SpendingBarData) => {
  Chart.register(ChartDataLabels);
  const chartRef = useRef<HTMLElement | null>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);

  let average = Math.floor(data.reduce((prev, curr) => prev + getTotalMoneySpent(curr.spendingInfo), 0) / data.length);
  average = average === 0 ? 1 : average;

  const [barData, setBarData] = useState({
    labels: [title],
    datasets: data.map((val) => transformReimbursementDataToBarData(val.title, average, val.spendingInfo, data.length))
  });

  useEffect(() => {
    const handleClick = (event: any) => {
      if (chartRef.current && !chartRef.current.contains(event.target)) {
        setHoveredIndex(undefined);
        setBarData((prev) => ({
          ...prev,
          datasets: data.map((val) => transformReimbursementDataToBarData(val.title, average, val.spendingInfo, data.length))
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
              getBarData('Leadership', val.spendingInfo.pendingLeadership + average, '#ef2020', data.length + 4),
              getBarData('Finance', val.spendingInfo.pendingFinance + average, '#ef4545', data.length + 4),
              getBarData('SABO', val.spendingInfo.submittedToSabo + average, '#efA0A0', data.length + 4),
              getBarData('Reimbursed', val.spendingInfo.reimbursed + average, grey[800], data.length + 4),
              getBarData('Available', val.spendingInfo.available + average, grey[500], data.length + 4)
            ];
          }
          return transformReimbursementDataToBarData(val.title, average, val.spendingInfo, data.length + 4);
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
    layout: {
      padding: 0
    },
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

          if (
            dataset &&
            datasetIndex !== hoveredIndex &&
            dataset.spendingInfo.totalBudget < getTotalMoneySpent(dataset.spendingInfo)
          ) {
            return '#ef4545';
          }
          return 'white';
        },
        anchor: 'center',
        align: 'center',
        textAlign: 'center',
        formatter: (value, context) => {
          const realValue = value - average;
          let { label } = context.dataset;
          const datasetMeta = context.chart.getDatasetMeta(context.datasetIndex);
          const bar: any = datasetMeta.data[context.dataIndex];

          const barWidth = bar.width;

          const maxTextLength = Math.floor(barWidth / 8);

          // Truncate the text with ellipsis if it exceeds the maximum length
          if (label && label.length > maxTextLength) {
            label = label.slice(0, maxTextLength) + '...';
          }

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

          if (dataset && dataset.spendingInfo.totalBudget < getTotalMoneySpent(dataset.spendingInfo)) {
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

            return `${title}: $${value}`;
          },
          title: (tooltipItems) => {
            let [{ datasetIndex }] = tooltipItems;

            if (hoveredIndex !== undefined && datasetIndex >= hoveredIndex) {
              datasetIndex -= Math.min(datasetIndex - hoveredIndex, 4);
            }
            const dataset = data[datasetIndex];

            if (dataset && dataset.spendingInfo.totalBudget < getTotalMoneySpent(dataset.spendingInfo)) {
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
        display: false,
        grid: { drawTicks: false },
        max: barData.datasets.reduce((prev, curr) => prev + curr.data[0], 0)
      },
      y: {
        display: false,
        grid: { drawTicks: false }
      }
    },
    onHover: (event, chartElement) => {
      const target = event.native?.target;
      if (target instanceof HTMLElement) {
        if (chartElement.length > 0) {
          target.style.cursor = 'pointer';
        } else {
          target.style.cursor = 'default';
        }
      }
    }
  };

  return (
    <>
      <Typography fontWeight={'bold'} variant="body1">
        {title}
      </Typography>
      {data.length > 0 ? (
        <Box ref={chartRef} height={100} sx={{ padding: 0, margin: 0 }}>
          <Bar data={barData} options={config} />
        </Box>
      ) : (
        <Typography>No Spending Data Available</Typography>
      )}
    </>
  );
};

export default SpendingBar;
