import { Box, Typography, Card, useTheme } from '@mui/material';
import { eachDayOfInterval, isMonday, format, getDate } from 'date-fns';
import { GANTT_CHART_GAP_SIZE, GANTT_CHART_CELL_SIZE } from '../../utils/gantt.utils';

interface GanttChartCalendarProps {
  start: Date;
  end: Date;
}

export function GanttChartCalendar({ start, end }: GanttChartCalendarProps) {
  const theme = useTheme();
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));

  return (
    <Box sx={{ pl: 2, position: 'sticky', top: 0, backgroundColor: theme.palette.background.default, zIndex: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gap: GANTT_CHART_GAP_SIZE,
          gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${days.length}, minmax(auto, 1fr))`
        }}
      >
        {days.map((day, index) => {
          // displays the month and year for the first monday of a month;
          // displays the month and year for the first date on the calendar if it's the first or second monday
          const monthDisplay = (index === 0 && getDate(day) <= 14) || getDate(day) <= 7 ? format(day, 'MMM y') : '';
          return (
            <Box
              key={day.toISOString()}
              sx={{
                whiteSpace: 'nowrap',
                lineHeight: '1rem',
                textAlign: 'center',
                height: '2rem',
                minWidth: GANTT_CHART_CELL_SIZE,
                maxWidth: GANTT_CHART_CELL_SIZE
              }}
            >
              <Typography fontWeight="bold" variant="h6">
                {monthDisplay}
              </Typography>
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
            <Card
              key={day.toISOString()}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '0.25rem',
                textAlign: 'center',
                height: '1.75rem',
                minWidth: GANTT_CHART_CELL_SIZE,
                maxWidth: GANTT_CHART_CELL_SIZE
              }}
            >
              <Typography>{format(day, 'd')}</Typography>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
