import { Box, Stack, Typography } from '@mui/material';
import { Circle } from '@mui/icons-material';
import { datePipe } from '../../../utils/pipes';

interface TimelineEvent {
  description: string;
  time: Date;
}

interface TimelineProps {
  events: TimelineEvent[];
}

interface EventSectionProps {
  event: TimelineEvent;
  isLast: boolean;
}
const ReimbursementRequestTimeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <Stack alignItems="center" spacing={0.5}>
      {events.map((event, index) => (
        <EventSection event={event} isLast={events.length - 1 === index} />
      ))}
    </Stack>
  );
};

const EventSection: React.FC<EventSectionProps> = ({ event, isLast }) => {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" width="100%">
      <Box flex={1} textAlign="right">
        <Typography fontWeight={'regular'} fontSize={18} variant="h1">
          {datePipe(event.time)}
        </Typography>
      </Box>

      <Box position="relative" display="flex" flexDirection="column" alignItems="center">
        <Circle sx={{ fontSize: 20 }} />
        {isLast ? (
          <></>
        ) : (
          <Box
            sx={{
              width: '4px',
              height: '50px',
              backgroundColor: 'white',
              mt: 0.5
            }}
          />
        )}
      </Box>

      <Box flex={1}>
        <Typography fontWeight={'regular'} fontSize={18} variant="h1">
          {event.description}
        </Typography>
      </Box>
    </Stack>
  );
};

export default ReimbursementRequestTimeline;
