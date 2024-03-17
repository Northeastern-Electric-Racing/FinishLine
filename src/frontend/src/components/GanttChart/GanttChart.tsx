import { addDays, differenceInDays, eachDayOfInterval, getDate, isMonday, isWeekend } from 'date-fns';
import { ComponentProps, DragEvent, MouseEvent, useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';
import { Date_Event, EventChange, applyChangesToEvents } from './event';
import { dateFormatMonthDate, dateToString } from './date.utils';
import useId from '@mui/material/utils/useId';
import dayjs from 'dayjs';
import { Box, useTheme } from '@mui/material';
import { purple } from '@mui/material/colors';

interface GanttChartProps {
  start: Date;
  end: Date;
  data: Date_Event[];
}

export function GanttChart({ start, end, data }: GanttChartProps) {
  const days = eachDayOfInterval({ start, end });

  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);
  const createChange = (change: EventChange) => {
    setEventChanges([...eventChanges, change]);
  };
  const removeChange = (changeId: string) => {
    setEventChanges([...eventChanges.filter((ec) => ec.id !== changeId)]);
  };

  const displayEvents = applyChangesToEvents(data, eventChanges);

  return (
    <div>
      <section style={{ overflow: 'scroll', padding: 5 }}>
        {/* Calendar/timeline */}
        <Box
          sx={{
            display: 'grid',
            gap: '0.25rem',
            gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${days.length}, minmax(auto, 1fr))`
          }}
        >
          {days.map((day) => {
            const showDate = isMonday(day);
            const showMonth = getDate(day) <= 7; // only show month name once
            const weekend = isWeekend(day);
            const dateDisplay = showDate ? (showMonth ? dayjs(day).format('MMM D') : dayjs(day).format('D')) : '';
            return (
              <Box
                key={day.toISOString()}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: weekend ? '#E0E0E0' : '#424242',
                  borderRadius: '0.25rem',
                  color: 'white',
                  fontSize: '0.75rem',
                  lineHeight: '1rem',
                  textAlign: 'center',
                  height: '2.25rem',
                  minWidth: '1.56rem',
                  maxWidth: '1.56rem'
                }}
              >
                {dateDisplay}
              </Box>
            );
          })}
        </Box>
        {/* Data display: reset list of events every time eventChanges list changes using key */}
        <div style={{ marginTop: '1rem', width: '100%' }} key={eventChanges.length}>
          {displayEvents.map((event) => {
            return <Event key={event.id} days={days} event={event} createChange={createChange} />;
          })}
        </div>
      </section>

      {/* List of changes */}
      <h2 className="mt-10 text-3xl font-bold">Changes</h2>
      <div className="mt-5 space-y-2">
        {eventChanges.length === 0 && (
          <div>
            <i>No changes.</i>
          </div>
        )}
        {eventChanges.map((ec) => {
          const event = data.find((e) => e.id === ec.eventId);
          return (
            <div key={ec.id} className="p-5 rounded border flex items-center justify-between">
              {ec.type === 'change-end-date' && (
                <div>
                  <b>{event?.title}</b>: Change end date from {dateFormatMonthDate(ec.originalEnd)} to{' '}
                  {dateFormatMonthDate(ec.newEnd)}
                </div>
              )}
              {ec.type === 'shift-by-days' && (
                <div>
                  <b>{event?.title}</b>: Shift by {ec.days} days
                </div>
              )}
              <button onClick={() => removeChange(ec.id)}>remove</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Event({
  days,
  event,
  createChange,
  ...props
}: { days: Date[]; event: Date_Event; createChange: (change: EventChange) => void } & ComponentProps<'div'>) {
  const startCol = days.findIndex((day) => dateToString(day) === dateToString(event.start)) + 1;
  const endCol = days.findIndex((day) => dateToString(day) === dateToString(event.end)) + 2;

  const id = useId() || 'id'; // id for creating event changes
  const [measureRef, bounds] = useMeasure();
  const [initialWidth, setInitialWidth] = useState(0); // original width of the component, should not change on resize
  const [width, setWidth] = useState(0); // current width of component, will change on resize

  const theme = useTheme();

  useEffect(() => {
    if (bounds.width !== 0 && width === 0) {
      setInitialWidth(bounds.width);
      setWidth(bounds.width);
    }
  }, [bounds]);

  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const lengthInDays = differenceInDays(event.end, event.start);

  const handleMouseDown = (e: MouseEvent<HTMLElement>) => {
    setIsResizing(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (isResizing) {
      const currentX = e.clientX;
      const deltaX = currentX - startX!;
      setWidth(Math.max(100, width + deltaX));
      setStartX(currentX);
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      console.log(initialWidth);
      // Use change in width to calculate new length
      const newEventLengthInDays = Math.round((lengthInDays / initialWidth) * width);
      const newEndDate = addDays(event.start, newEventLengthInDays);
      createChange({ id, eventId: event.id, type: 'change-end-date', originalEnd: event.end, newEnd: newEndDate });
    }
  };

  const [showDropPoints, setShowDropPoints] = useState(false);

  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    setShowDropPoints(true);
  };
  const onDragEnd = (e: DragEvent<HTMLDivElement>) => {
    setShowDropPoints(false);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDrop = (day: Date) => {
    const days = differenceInDays(day, event.start);
    createChange({ id, eventId: event.id, type: 'shift-by-days', days });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gap: '0.25rem',
          gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${days.length}, minmax(auto, 1fr))`,
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        {/* Drop areas */}
        {showDropPoints &&
          days.map((day, index) => (
            <Box
              key={index}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(day)}
              sx={{
                borderRadius: '0.25rem',
                height: '2.25rem',
                padding: '.78rem',
                backgroundColor: `rgba(37, 99, 235, 0.1)`
              }}
            />
          ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: '0.25rem',
          gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${days.length}, minmax(1.56rem, 1fr))`,
          width: '100%'
        }}
      >
        <div
          ref={measureRef}
          {...props}
          style={{
            gridColumnStart: startCol,
            gridColumnEnd: endCol,
            height: '2.25rem',
            width: width === 0 ? `unset` : `${width}px`,
            border: `1px solid ${isResizing ? 'rgb(37 99 235)' : theme.palette.divider}`,
            borderRadius: '0.25rem',
            backgroundColor: purple[100]
          }}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              overflow: 'visible'
            }}
          >
            <Box
              draggable
              onDrag={onDragStart}
              onDragEnd={onDragEnd}
              style={{
                padding: '0.25rem',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                userSelect: 'none'
              }}
            >
              {event.title} ({dayjs(event.start).format('MMM D')}-{dayjs(event.end).format('MMM D')})
            </Box>
            <Box
              sx={{ cursor: 'ew-resize', height: '100%', width: '5rem', position: 'relative', right: '-10' }}
              onMouseDown={handleMouseDown}
            />
          </Box>
        </div>
      </Box>
    </div>
  );
}
