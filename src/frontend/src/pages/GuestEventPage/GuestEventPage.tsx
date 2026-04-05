import { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Collapse, IconButton, Stack, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import GuestEventCard from './GuestEventCard';
import { EventInstance, formatEventDate } from 'shared';
import { useAllEventsPaginated } from '../../hooks/calendar.hooks';

const groupInstancesByDate = (instances: EventInstance[]): [string, EventInstance[]][] => {
  const groups = new Map<string, { date: Date; instances: EventInstance[] }>();
  for (const instance of instances) {
    const date = new Date(instance.startTime);
    const key = formatEventDate(date);
    if (!groups.has(key)) groups.set(key, { date, instances: [] });
    groups.get(key)!.instances.push(instance);
  }
  return Array.from(groups.entries())
    .sort(([, a], [, b]) => b.date.getTime() - a.date.getTime())
    .map(([key, { instances }]) => [key, instances]);
};

interface DateGroupProps {
  date: string;
  instances: EventInstance[];
}

const DateGroup: React.FC<DateGroupProps> = ({ date, instances }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ cursor: 'pointer', borderBottom: `1px solid ${theme.palette.divider}`, pb: 0.5, mb: 1 }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Typography variant="h6" fontWeight="bold">
          {date}
        </Typography>
        <IconButton size="small">{open ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
      </Stack>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {instances.map((instance) => (
            <GuestEventCard key={`${instance.eventId}-${instance.scheduleSlotId}`} event={instance} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

const GuestEventPage: React.FC = () => {
  const [cursor, setCursor] = useState<Date | undefined>(undefined);
  const [allInstances, setAllInstances] = useState<EventInstance[]>([]);
  const { data, isLoading, isError, error } = useAllEventsPaginated(cursor);

  useEffect(() => {
    if (data?.instances) {
      setAllInstances((prev) => {
        const existingKeys = new Set(prev.map((i) => `${i.eventId}-${i.scheduleSlotId}`));
        const newInstances = data.instances.filter((i) => !existingKeys.has(`${i.eventId}-${i.scheduleSlotId}`));
        return newInstances.length > 0 ? [...prev, ...newInstances] : prev;
      });
    }
  }, [data]);

  if (isLoading && allInstances.length === 0) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const groups = groupInstancesByDate(allInstances);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
      {groups.map(([date, instances]) => (
        <DateGroup key={date} date={date} instances={instances} />
      ))}
      {data?.nextCursor && (
        <Button variant="outlined" onClick={() => setCursor(data.nextCursor!)} disabled={isLoading}>
          {isLoading ? <LoadingIndicator /> : 'Load More'}
        </Button>
      )}
    </Box>
  );
};

export default GuestEventPage;
