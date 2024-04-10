import { Box, Typography, Card } from '@mui/material';
import { eachDayOfInterval, isMonday, format, getDate } from 'date-fns';
import { GANTT_CHART_GAP_SIZE, GANTT_CHART_CELL_SIZE } from '../../../../../utils/gantt.utils';

interface GanttChartCalendarProps {
  start: Date;
  end: Date;
}

export function GanttChartCalendar({ start, end }: GanttChartCalendarProps) {
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));

  return (
    <Box sx={{ pl: 2 }}>
      {/* Year Display */}
      <Box
        sx={{
          display: 'grid',
          gap: GANTT_CHART_GAP_SIZE,
          gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${days.length}, minmax(auto, 1fr))`
        }}
      >
        {days.map((day, index) => {
          // Show the year on the first date and on the first day of a new year
          const yearDisplay = index === 0 || (day.getMonth() === 0 && getDate(day) <= 7) ? format(day, 'y') : '';
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
                {yearDisplay}
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
                borderRadius: '0.25rem',
                lineHeight: '1rem',
                textAlign: 'center',
                height: '3.25rem',
                minWidth: GANTT_CHART_CELL_SIZE,
                maxWidth: GANTT_CHART_CELL_SIZE
              }}
            >
              <Typography fontWeight="bold">{format(day, 'MMM')}</Typography>
              <Typography fontWeight="bold">{format(day, 'd')}</Typography>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
