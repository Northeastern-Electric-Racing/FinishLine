import { addDays, differenceInDays, eachDayOfInterval, getDate, isMonday, isWeekend } from 'date-fns';
import { ComponentProps, DragEvent, MouseEvent, useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';
import { Date_Event, EventChange, applyChangeToEvent, applyChangesToEvents } from './event';
import { dateFormatMonthDate, dateToString } from './date.utils';
import useId from '@mui/material/utils/useId';
import dayjs from 'dayjs';
import { Box, Grid } from '@mui/material';

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
      <section style={{ overflow: 'scroll', padding: 1 }}>
        {/* Calendar/timeline */}
        <Box
          gridTemplateColumns={`repeat(${days.length}, minmax(0, 1fr))`}
          sx={{
            display: 'flex',
            gap: 0.5,
            gridTemplateRows: 'repeat(1, minmax(0, 1fr))',
            width: 'fit-content'
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
        <div style={{ marginTop: '4px' }} key={eventChanges.length}>
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

  useEffect(() => {
    if (bounds.width != 0 && width === 0) {
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
    <div style={{ position: 'relative' }}>
      <Box
        gridTemplateColumns={`repeat(${days.length}, minmax(0, 1fr))`}
        style={{
          width: '100%',
          display: 'flex',
          gap: 0.5,
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
              style={{
                borderRadius: '0.25rem',
                height: '2.25rem',
                padding: '.78rem',
                backgroundColor: `rgba(37, 99, 235, 0.1)`
              }}
            />
          ))}
      </Box>
      {/** <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            gridTemplateRows: 'repeat(1, minmax(0, 1fr))',
            gap: '2rem',
            width: 'fit-content'
          }}
        >*/}
      <Grid gap={1} style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        <div
          ref={measureRef}
          {...props}
          style={{
            gridColumnStart: startCol,
            gridColumnEnd: endCol,
            height: '2.25rem',
            width: width === 0 ? `unset` : `${width}px`,
            borderWidth: '1px',
            borderRadius: '0.25rem',
            borderColor: isResizing ? 'rgb(37 99 235)' : ''
          }}
          className={`${props.className} bg-gray-100 ${isResizing && `border-blue-600`}`}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              overflow: 'visible'
            }}
          >
            <div
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
              {event.title} ({dayjs(event.start).format('MMM D')}–{dayjs(event.end).format('MMM D')})
            </div>
            <div
              style={{ cursor: 'ew-resize', height: '100%', width: '5rem', position: 'relative', right: '-10' }}
              onMouseDown={handleMouseDown}
            ></div>
          </div>
        </div>
      </Grid>
    </div>
  );
}
