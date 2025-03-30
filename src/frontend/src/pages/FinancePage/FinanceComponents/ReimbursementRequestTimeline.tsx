import { Box, Stack, Typography } from '@mui/material';
import { Circle, LineStyleRounded } from '@mui/icons-material';
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
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const FirstEvent = events[1];
  return (
    <Stack direction={'column'}>
      <Circle sx={{ fontSize: 20 }} />
      <EventSection event={FirstEvent} />
      <Circle sx={{ fontSize: 20 }} />
    </Stack>
  );
};

const EventSection: React.FC<EventSectionProps> = ({ event }) => {
  return (
    <Stack direction={'row'}>
      <Box>
        <Typography fontWeight={'regular'} fontSize={20} variant="h6">
          {datePipe(event.time)}
        </Typography>
      </Box>
      <LineStyleRounded />
      <Box>
        <Typography fontWeight={'regular'} fontSize={20} variant="h6">
          {event.description}
        </Typography>
      </Box>
    </Stack>
  );
};

export default Timeline;
