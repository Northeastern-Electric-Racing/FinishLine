import { addDays, differenceInDays, eachDayOfInterval, getDate, isMonday, isWeekend } from 'date-fns';
import { ComponentProps, DragEvent, MouseEvent, useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';
import { Date_Event, EventChange, applyChangeToEvent, applyChangesToEvents } from './event';
import { dateFormatMonthDate, dateToString } from './date.utils';
import useId from '@mui/material/utils/useId';
import dayjs from 'dayjs';

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
      <section>
        {/* Calendar/timeline */}
        <div className="grid grid-rows-1 gap-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day) => {
            const showDate = isMonday(day);
            const showMonth = getDate(day) <= 7; // only show month name once
            const weekend = isWeekend(day);
            const dateDisplay = showDate ? (showMonth ? dayjs(day).format('MMMMM d') : dayjs(day).format('d')) : '';
            return (
              <div
                key={day.toISOString()}
                className={`${weekend ? 'bg-gray-200' : 'bg-gray-700'} p-0.5 w-full rounded text-white text-xs`}
              >
                {dateDisplay}
              </div>
            );
          })}
        </div>
        {/* Data display: reset list of events every time eventChanges list changes using key */}
        <div className="mt-4 space-y-1" key={eventChanges.length}>
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
    <div className="relative">
      <div
        className="absolute top-0 left-0 w-full grid gap-1"
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {/* Drop areas */}
        {showDropPoints &&
          days.map((day, index) => (
            <div
              key={index}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(day)}
              className="rounded p-1 h-9 bg-blue-600/10"
            ></div>
          ))}
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        <div
          ref={measureRef}
          {...props}
          style={{ gridColumnStart: startCol, gridColumnEnd: endCol, width: width === 0 ? `unset` : `${width}px` }}
          className={`${props.className} h-9 bg-gray-100 border ${isResizing && `border-blue-600`} rounded`}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="h-full w-full flex items-center justify-between overflow-visible">
            <div draggable onDrag={onDragStart} onDragEnd={onDragEnd} className="p-1 line-clamp-1 select-none">
              {event.title} ({dayjs(event.start).format('d')}–{dayjs(event.end).format('d')})
            </div>
            <div className="cursor-ew-resize h-full w-20 relative -right-10" onMouseDown={handleMouseDown}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
