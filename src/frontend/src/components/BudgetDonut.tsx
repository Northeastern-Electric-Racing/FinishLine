import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { ArcElement, Chart, ChartOptions, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BUDGET_CHART_COLORS, EXEC_SUMMARY_BACKGROUND, formatDollars } from '../utils/exec-summary.utils';

Chart.register(ArcElement, Tooltip, Legend);

interface BudgetDonutProps {
  values: { label: string; value: number }[];
  centerText: string;
  colorsByLabel?: Map<string, string>;
  amountLabel?: string;
  maxSize?: number;
}

/**
 * A donut of budget by division with a highlighted total in the middle.
 */
const BudgetDonut: React.FC<BudgetDonutProps> = ({
  values,
  centerText,
  colorsByLabel,
  amountLabel = 'budgeted',
  maxSize = 160
}) => {
  const accent = useTheme().palette.primary.main;

  const chartData = {
    labels: values.map((v) => v.label),
    datasets: [
      {
        data: values.map((v) => v.value),
        backgroundColor: values.map(
          (v, idx) => colorsByLabel?.get(v.label) ?? BUDGET_CHART_COLORS[idx % BUDGET_CHART_COLORS.length]
        ),
        borderColor: EXEC_SUMMARY_BACKGROUND,
        borderWidth: 2
      }
    ]
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatDollars(ctx.parsed)} ${amountLabel}` } }
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: maxSize, aspectRatio: '1 / 1', flexShrink: 0 }}>
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Doughnut data={chartData} options={chartOptions} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '62%',
          height: '62%',
          borderRadius: '50%',
          border: `10px solid ${accent}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <Typography variant="h5">{centerText}</Typography>
      </Box>
    </Box>
  );
};

export default BudgetDonut;
