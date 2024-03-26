import { Box, Typography, useTheme } from '@mui/material';
import { eachDayOfInterval, isMonday, format } from 'date-fns';
import { GANTT_CHART_GAP_SIZE, GANTT_CHART_CELL_SIZE } from '../../../../../utils/gantt.utils';

interface GanttChartTimelineProps {
  startDate: Date;
  endDate: Date;
}

export function GanttChartTimeline({ startDate, endDate }: GanttChartTimelineProps) {
  const theme = useTheme();
  const days = eachDayOfInterval({ start: startDate, end: endDate }).filter((day) => isMonday(day));

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gap: GANTT_CHART_GAP_SIZE,
          gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${days.length}, minmax(auto, 1fr))`,
          maxWidth: 10
        }}
      >
        {days.map((day) => {
          // TODO: have year only display once on the first jan monday
          const yearDisplay = day.getMonth() === 0 ? format(day, 'y') : '';
          return (
            <Box
              key={day.toISOString()}
              sx={{
                color: 'white',
                whiteSpace: 'nowrap',
                lineHeight: '1rem',
                textAlign: 'center',
                height: '2rem',
                minWidth: GANTT_CHART_CELL_SIZE,
                maxWidth: GANTT_CHART_CELL_SIZE
              }}
            >
              <Typography fontWeight="bold">{yearDisplay}</Typography>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: GANTT_CHART_GAP_SIZE,
          gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${days.length}, minmax(auto, 1fr))`,
          maxWidth: 10
        }}
      >
        {days.map((day) => {
          return (
            <Box
              key={day.toISOString()}
              sx={{
                backgroundColor: theme.palette.background.default,
                borderRadius: '0.25rem',
                color: 'white',
                lineHeight: '1rem',
                textAlign: 'center',
                height: '3.25rem',
                minWidth: GANTT_CHART_CELL_SIZE,
                maxWidth: GANTT_CHART_CELL_SIZE
              }}
            >
              <Typography fontWeight="bold">{format(day, 'MMM')}</Typography>
              <Typography fontWeight="bold">{format(day, 'd')}</Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
