import { useEffect, useRef, useState, forwardRef } from 'react';
import { Box, Button } from '@mui/material';
import { Collapse, IconButton, Stack, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TodayIcon from '@mui/icons-material/Today';
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
    .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
    .map(([key, { instances }]) => [key, instances]);
};

interface DateGroupProps {
  date: string;
  instances: EventInstance[];
}

const DateGroup = forwardRef<HTMLDivElement, DateGroupProps>(({ date, instances }, ref) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const todayKey = formatEventDate(new Date());
  const label = date === todayKey ? `Today: ${date}` : date;

  return (
    <Box ref={ref}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ cursor: 'pointer', borderBottom: `1px solid ${theme.palette.divider}`, pb: 0.5, mb: 1 }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Typography variant="h6" fontWeight="bold">
          {label}
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
});

const GuestEventPage: React.FC = () => {
  const [futureCursor, setFutureCursor] = useState<Date | undefined>(undefined);
  const [pastCursor, setPastCursor] = useState<Date | undefined>(undefined);
  const [futureInstances, setFutureInstances] = useState<EventInstance[]>([]);
  const [pastInstances, setPastInstances] = useState<EventInstance[]>([]);
  const [hasScrolled, setHasScrolled] = useState(false);
  const todayRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError, error } = useAllEventsPaginated(futureCursor, pastCursor);

  useEffect(() => {
    if (data?.futureInstances) {
      setFutureInstances((prev) => {
        const existingKeys = new Set(prev.map((i) => `${i.eventId}-${i.scheduleSlotId}`));
        const next = data.futureInstances.filter((i) => !existingKeys.has(`${i.eventId}-${i.scheduleSlotId}`));
        return next.length > 0 ? [...prev, ...next] : prev;
      });
    }
    if (data?.pastInstances) {
      setPastInstances((prev) => {
        const existingKeys = new Set(prev.map((i) => `${i.eventId}-${i.scheduleSlotId}`));
        const next = data.pastInstances.filter((i) => !existingKeys.has(`${i.eventId}-${i.scheduleSlotId}`));
        return next.length > 0 ? [...prev, ...next] : prev;
      });
    }
  }, [data]);

  useEffect(() => {
    if (!hasScrolled && (futureInstances.length > 0 || pastInstances.length > 0)) {
      todayRef.current?.scrollIntoView({ block: 'start' });
      setHasScrolled(true);
    }
  }, [futureInstances, pastInstances, hasScrolled]);

  if (isLoading && futureInstances.length === 0 && pastInstances.length === 0) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const pastGroups = groupInstancesByDate(pastInstances);
  const futureGroups = groupInstancesByDate(futureInstances);
  const todayKey = formatEventDate(new Date());

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        onClick={() => todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        startIcon={<TodayIcon />}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(6px)',
          boxShadow: 3,
          zIndex: 1,
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.35)'
        }}
        variant="contained"
        disableElevation
      >
        Jump to Today
      </Button>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
        {data?.nextPastCursor && (
          <Button variant="outlined" onClick={() => setPastCursor(data.nextPastCursor!)} disabled={isLoading}>
            {isLoading ? <LoadingIndicator /> : 'Load More Past Events'}
          </Button>
        )}
        {pastGroups.map(([date, instances]) => (
          <DateGroup key={date} ref={date === todayKey ? todayRef : null} date={date} instances={instances} />
        ))}
        {futureGroups.map(([date, instances]) => (
          <DateGroup key={date} ref={date === todayKey ? todayRef : null} date={date} instances={instances} />
        ))}
        {data?.nextFutureCursor && (
          <Button variant="outlined" onClick={() => setFutureCursor(data.nextFutureCursor!)} disabled={isLoading}>
            {isLoading ? <LoadingIndicator /> : 'Load More Future Events'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default GuestEventPage;
