/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { BayDashboardWidgetSize, BayDashboardWidgetType, PublicBayDashboardCalendarEvent } from 'shared';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import NERWidget from '../../../../components/NERWidget';
import { useGetBayDashboardCalendarEvents } from '../../../../hooks/bay-dashboard.hooks';
import {
  formatCalendarDay,
  getCalendarDays,
  getNextEventDay,
  groupEventsByDay,
  LARGE_CALENDAR_MAX_DAYS,
  limitEventsToHeight,
  MEDIUM_CALENDAR_MAX_EVENTS
} from '../../../../utils/bay-dashboard-calendar.utils';
import { BayDashboardWidgetProps, bayDashboardWidgetDisplayNames } from '../../../../utils/bay-dashboard.utils';
import CalendarEventCard from './CalendarEventCard';

const textSx = { color: 'white' };
const moreSx = { ...textSx, fontSize: '2.2cqw' };

// the current time, updated every minute so the days and the events that have ended stay right on a TV that's never refreshed
const useNow = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
};

interface CalendarEventsProps {
  events: PublicBayDashboardCalendarEvent[];
  now: Date;
}

const LargeCalendar: React.FC<CalendarEventsProps> = ({ events, now }) => {
  const days = limitEventsToHeight(groupEventsByDay(events, getCalendarDays(now, LARGE_CALENDAR_MAX_DAYS)));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5cqw', mt: '1cqw' }}>
      {days.map(({ day, events: dayEvents, hiddenCount }) => (
        <Box key={day.toISOString()}>
          <Typography sx={{ ...textSx, fontSize: '2.4cqw', mb: '0.5cqw' }}>{formatCalendarDay(day)}</Typography>
          {dayEvents.length === 0 && hiddenCount === 0 ? (
            <Box sx={{ px: '2.5cqw', py: '0.8cqw', borderRadius: '1cqw', bgcolor: 'rgba(0, 0, 0, 0.6)' }}>
              <Typography sx={{ ...textSx, fontSize: '1.9cqw' }}>No events</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.8cqw' }}>
              {dayEvents.map((event, i) => (
                <CalendarEventCard key={`${event.title}-${event.startTime.getTime()}-${i}`} event={event} day={day} dense />
              ))}
              {hiddenCount > 0 && <Typography sx={{ ...moreSx, fontSize: '1.8cqw' }}>+{hiddenCount} more</Typography>}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

const MediumCalendar: React.FC<CalendarEventsProps> = ({ events, now }) => {
  const nextEventDay = getNextEventDay(events, now);

  if (!nextEventDay) return <Typography sx={{ ...textSx, fontSize: '2.4cqw' }}>No upcoming events</Typography>;

  const { day, events: dayEvents } = nextEventDay;
  const shownEvents = dayEvents.slice(0, MEDIUM_CALENDAR_MAX_EVENTS);
  const hiddenCount = dayEvents.length - shownEvents.length;

  return (
    <Box sx={{ mt: '1cqw' }}>
      {/* the date is only shown when it isn't today */}
      {!dayjs(day).isSame(now, 'day') && (
        <Typography sx={{ ...textSx, fontSize: '2.4cqw', mb: '0.5cqw' }}>{formatCalendarDay(day)}</Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${MEDIUM_CALENDAR_MAX_EVENTS}, 1fr)`, gap: '2cqw' }}>
        {shownEvents.map((event, i) => (
          <CalendarEventCard key={`${event.title}-${event.startTime.getTime()}-${i}`} event={event} day={day} />
        ))}
      </Box>
      {hiddenCount > 0 && <Typography sx={{ ...moreSx, mt: '1cqw' }}>+{hiddenCount} more</Typography>}
    </Box>
  );
};

/**
 * The upcoming events from the organization's calendars, for the TV.
 * The large widget groups the next few days, and the medium widget shows one day: today, or the next day with events.
 */
const CalendarWidget: React.FC<BayDashboardWidgetProps> = ({ size, slug }) => {
  const { data: events, isLoading, isError, error } = useGetBayDashboardCalendarEvents(slug);
  const now = useNow();

  const title = bayDashboardWidgetDisplayNames[BayDashboardWidgetType.CALENDAR];

  const renderContent = () => {
    // a failed refetch keeps the last events that loaded, so only show the error when there's nothing to display
    if (isError && events === undefined)
      return <Typography sx={{ ...textSx, fontSize: '2.4cqw' }}>{error.message}</Typography>;
    if (isLoading || events === undefined) return <LoadingIndicator />;

    if (size === BayDashboardWidgetSize.LARGE) return <LargeCalendar events={events} now={now} />;
    if (size === BayDashboardWidgetSize.MEDIUM) return <MediumCalendar events={events} now={now} />;
    return null;
  };

  // without a slug only the frame is shown
  return (
    <NERWidget size={size} title={title}>
      {slug && renderContent()}
    </NERWidget>
  );
};

export default CalendarWidget;
