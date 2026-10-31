import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { BarElement, CategoryScale, Chart, ChartOptions, LinearScale, Legend, Plugin, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { daysBetween, ExecutiveSummary, VehicleDevelopmentProjectSummary } from 'shared';
import { useVehicleDevelopmentSummary } from '../hooks/exec-summaries.hooks';
import { useAllTeams } from '../hooks/teams.hooks';
import { getDaysAxisTicks, getElapsedDays } from '../utils/exec-summary.utils';
import { datePipe } from '../utils/pipes';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';

Chart.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

// the executive panel is always a dark card, regardless of the app theme
const BACKGROUND = '#121212';
const ROW_HEIGHT = 34;
const ALL_TEAMS = 'all';
const ELAPSED_COLOR = '#ef4345';
const REMAINING_COLOR = '#9B3425';

interface ExecutiveSummaryVehicleDevelopmentProps {
  executiveSummary: ExecutiveSummary;
}

const ExecutiveSummaryVehicleDevelopment: React.FC<ExecutiveSummaryVehicleDevelopmentProps> = ({ executiveSummary }) => {
  const accent = useTheme().palette.primary.main;
  const today = new Date();
  const [teamId, setTeamId] = useState<string>(ALL_TEAMS);
  const { data: teams, isLoading: teamsIsLoading, isError: teamsIsError } = useAllTeams();
  const {
    data: summary,
    isLoading,
    isError,
    error
  } = useVehicleDevelopmentSummary(executiveSummary.executiveSummaryId, teamId === ALL_TEAMS ? undefined : teamId);

  if (isError) return <ErrorPage message={error?.message} />;

  const projects: VehicleDevelopmentProjectSummary[] = summary?.projects ?? [];
  // every bar starts at day 0 and is as long as the project, so bars compare project lengths
  const lengths = projects.map((p) => Math.max(0, daysBetween(p.plannedEndDate, p.startDate)));
  const elapsedDays = projects.map((p) => getElapsedDays(p, today));
  const ticks = getDaysAxisTicks(Math.max(0, ...lengths));

  // each project is drawn as an elapsed segment (project start to today) followed by a remaining segment (today to end)
  const barStyle = { borderRadius: 0, barThickness: 22, grouped: false };
  const chartData = {
    labels: projects.map((p) => p.name),
    datasets: [
      { ...barStyle, label: 'Elapsed', data: elapsedDays.map((elapsed) => [0, elapsed]), backgroundColor: ELAPSED_COLOR },
      {
        ...barStyle,
        label: 'Remaining',
        data: lengths.map((length, idx) => [elapsedDays[idx], length]),
        backgroundColor: REMAINING_COLOR
      }
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
        const startLabel = datePipe(project.startDate, false);
        const endX = x.getPixelForValue(lengths[idx]) + 6;
        ctx.fillText(startLabel, startX + 6, yPos);
        // hide the end date if it would overlap the start date on very short bars
        if (endX >= startX + 6 + ctx.measureText(startLabel).width + 6) {
          ctx.fillText(datePipe(project.plannedEndDate, false), endX, yPos);
        }
        if (elapsedDays[idx] > 0 && elapsedDays[idx] < lengths[idx]) {
          ctx.save();
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = 'white';
          ctx.beginPath();
          ctx.moveTo(progressX, yPos - 11);
          ctx.lineTo(progressX, yPos + 11);
          ctx.stroke();
          ctx.restore();
          ctx.fillText(datePipe(today, false), progressX + 6, yPos);
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
      legend: { display: true, labels: { color: 'white' } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const p = projects[ctx.dataIndex];
            const isElapsed = ctx.datasetIndex === 0;
            const segmentStart = isElapsed ? datePipe(p.startDate, false) : datePipe(today, false);
            const segmentEnd = isElapsed ? datePipe(today, false) : datePipe(p.plannedEndDate, false);
            return `${ctx.dataset.label}: ${segmentStart} - ${segmentEnd}`;
          }
        }
      }
    }
  };

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: BACKGROUND, color: 'white', width: '100%', height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={1}>
          <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Vehicle Development
          </Typography>
          <TextField
            select
            size="small"
            inputProps={{ 'aria-label': 'Team' }}
            disabled={teamsIsLoading || teamsIsError}
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
            <Bar key={teamId} data={chartData} options={chartOptions} plugins={[dateLabels]} />
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
