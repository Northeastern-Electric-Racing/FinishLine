import { useMemo, useRef, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Collapse, IconButton, Stack, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TodayIcon from '@mui/icons-material/Today';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import GuestEventCard from './GuestEventCard';
import { EventInstance, formatEventDate } from 'shared';
import { useFutureEventsPaginated, usePastEventsPaginated } from '../../hooks/calendar.hooks';

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

const DateGroup: React.FC<DateGroupProps> = ({ date, instances }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const todayKey = formatEventDate(new Date());
  const label = date === todayKey ? `Today: ${date}` : date;

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
};

const GuestEventPage: React.FC = () => {
  const todayRef = useRef<HTMLDivElement>(null);

  const {
    data: futureData,
    isLoading: futureLoading,
    isError: futureIsError,
    error: futureError,
    fetchNextPage: fetchNextFuture,
    hasNextPage: hasNextFuture,
    isFetchingNextPage: isFetchingNextFuture
  } = useFutureEventsPaginated();

  const {
    data: pastData,
    isLoading: pastLoading,
    isError: pastIsError,
    error: pastError,
    fetchNextPage: fetchNextPast,
    hasNextPage: hasNextPast,
    isFetchingNextPage: isFetchingNextPast
  } = usePastEventsPaginated();

  const futureInstances = useMemo(() => futureData?.pages.flatMap((p) => p.futureInstances) ?? [], [futureData]);
  const pastInstances = useMemo(() => pastData?.pages.flatMap((p) => p.pastInstances) ?? [], [pastData]);

  if (futureIsError) return <ErrorPage message={futureError!.message} />;
  if (pastIsError) return <ErrorPage message={pastError!.message} />;
  const isInitialLoading = (futureLoading || pastLoading) && futureInstances.length === 0 && pastInstances.length === 0;
  if (isInitialLoading) return <LoadingIndicator />;

  const pastGroups = groupInstancesByDate(pastInstances);
  const futureGroups = groupInstancesByDate(futureInstances);

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
        {hasNextPast && (
          <Button variant="outlined" onClick={() => fetchNextPast()} disabled={isFetchingNextPast}>
            {isFetchingNextPast ? <LoadingIndicator /> : 'Load More Past Events'}
          </Button>
        )}
        {pastGroups.map(([date, instances]) => (
          <DateGroup key={date} date={date} instances={instances} />
        ))}
        <div ref={todayRef} />
        {futureGroups.map(([date, instances]) => (
          <DateGroup key={date} date={date} instances={instances} />
        ))}
        {hasNextFuture && (
          <Button variant="outlined" onClick={() => fetchNextFuture()} disabled={isFetchingNextFuture}>
            {isFetchingNextFuture ? <LoadingIndicator /> : 'Load More Future Events'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default GuestEventPage;
