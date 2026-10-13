import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { BarElement, CategoryScale, Chart, ChartOptions, LinearScale, Plugin, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ExecutiveSummary, VehicleDevelopmentProjectSummary } from 'shared';
import { useVehicleDevelopmentSummary } from '../hooks/exec-summaries.hooks';
import { useAllTeams } from '../hooks/teams.hooks';
import { getBarLengthInDays, getDaysAxisTicks, getElapsedDays } from '../utils/exec-summary.utils';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip);

// the executive panel is always a dark card, regardless of the app theme
const BACKGROUND = '#121212';
const ROW_HEIGHT = 54;
const ALL_TEAMS = 'all';
const ELAPSED_COLOR = '#DC5350';
const REMAINING_COLOR = '#9B3425';

interface ExecutiveSummaryVehicleDevelopmentProps {
  executiveSummary: ExecutiveSummary;
}

// project dates are @db.Date values (midnight UTC), so they have to be formatted in UTC to avoid showing the previous day
const formatDate = (date: Date, utc = true): string =>
  date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', ...(utc ? { timeZone: 'UTC' } : {}) });

const ExecutiveSummaryVehicleDevelopment: React.FC<ExecutiveSummaryVehicleDevelopmentProps> = ({ executiveSummary }) => {
  const accent = useTheme().palette.primary.main;
  const today = new Date();
  const [teamId, setTeamId] = useState<string>(ALL_TEAMS);
  const { data: teams, isError: teamsIsError, error: teamsError } = useAllTeams();
  const {
    data: summary,
    isLoading,
    isError,
    error
  } = useVehicleDevelopmentSummary(executiveSummary.executiveSummaryId, teamId === ALL_TEAMS ? undefined : teamId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (teamsIsError) return <ErrorPage message={teamsError?.message} />;

  const projects: VehicleDevelopmentProjectSummary[] = summary?.projects ?? [];
  // every bar starts at day 0 and is as long as the project, so bars compare project lengths
  const lengths = projects.map((p) => getBarLengthInDays(p.startDate, p.plannedEndDate));
  const elapsedDays = projects.map((p) => getElapsedDays(p, today));
  const ticks = getDaysAxisTicks(Math.max(0, ...lengths));

  // each project is drawn as an elapsed segment (project start to today) followed by a remaining segment (today to end)
  const barStyle = { borderRadius: 0, barThickness: 34, grouped: false };
  const chartData = {
    labels: projects.map((p) => p.name),
    datasets: [
      { ...barStyle, data: elapsedDays.map((elapsed) => [0, elapsed]), backgroundColor: ELAPSED_COLOR },
      { ...barStyle, data: lengths.map((length, idx) => [elapsedDays[idx], length]), backgroundColor: REMAINING_COLOR }
    ]
  };

  // start date inside the left of the bar, a dotted marker + date where today falls, end date right of the bar
  const dateLabels: Plugin<'bar'> = {
    id: 'dateLabels',
    afterDatasetsDraw: (chart) => {
      const { ctx } = chart;
      const { x } = chart.scales;
      const { y } = chart.scales;
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.textBaseline = 'middle';
      projects.forEach((project, idx) => {
        const yPos = y.getPixelForValue(idx);
        const startX = x.getPixelForValue(0);
        const progressX = x.getPixelForValue(elapsedDays[idx]);
        ctx.textAlign = 'left';
        ctx.fillText(formatDate(project.startDate), startX + 6, yPos);
        ctx.fillText(formatDate(project.plannedEndDate), x.getPixelForValue(lengths[idx]) + 6, yPos);
        if (elapsedDays[idx] > 0 && elapsedDays[idx] < lengths[idx]) {
          ctx.save();
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = 'white';
          ctx.beginPath();
          ctx.moveTo(progressX, yPos - 17);
          ctx.lineTo(progressX, yPos + 17);
          ctx.stroke();
          ctx.restore();
          ctx.fillText(formatDate(today, false), progressX + 6, yPos);
        }
      });
      ctx.restore();
    }
  };

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    // leave room on both sides of the bars for the date labels
    layout: { padding: { right: 48 } },
    scales: {
      x: {
        position: 'bottom',
        min: 0,
        max: ticks[ticks.length - 1],
        afterBuildTicks: (scale) => {
          scale.ticks = ticks.map((value) => ({ value }));
        },
        title: { display: true, text: 'Days', color: 'white' },
        ticks: { color: 'white' },
        grid: { color: '#B3B3B3' }
      },
      y: { ticks: { color: 'white' }, grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const p = projects[ctx.dataIndex];
            return `${formatDate(p.startDate)} - ${formatDate(p.plannedEndDate)}`;
          }
        }
      }
    }
  };

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: BACKGROUND, color: 'white', width: '100%', maxWidth: 1000 }}>
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
          <Typography variant="h2" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Vehicle Development
          </Typography>
          <TextField
            select
            size="small"
            inputProps={{ 'aria-label': 'Team' }}
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': { backgroundColor: accent, borderRadius: 2, color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSelect-icon': { color: 'white' }
            }}
          >
            <MenuItem value={ALL_TEAMS}>All Teams</MenuItem>
            {(teams ?? []).map((team) => (
              <MenuItem key={team.teamId} value={team.teamId}>
                {team.teamName}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {isLoading || !summary ? (
          <LoadingIndicator />
        ) : projects.length === 0 ? (
          <Typography>No projects to show.</Typography>
        ) : (
          <Box sx={{ position: 'relative', height: projects.length * ROW_HEIGHT + 80 }}>
            <Bar data={chartData} options={chartOptions} plugins={[dateLabels]} />
          </Box>
        )}

        {/* TODO: re-enable once the "view more" destination is decided
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" color="primary">
            View more
          </Button>
        </Box> */}
      </CardContent>
    </Card>
  );
};

export default ExecutiveSummaryVehicleDevelopment;
