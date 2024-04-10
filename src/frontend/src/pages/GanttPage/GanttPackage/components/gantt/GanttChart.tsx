import { addDays, differenceInDays, eachDayOfInterval, isMonday } from 'date-fns';
import { ComponentProps, DragEvent, MouseEvent, useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';
import { EventChange, applyChangesToEvents } from '../other/event';
import { dateToString } from './date.utils';
import { Task } from '../../types/public-types';
import { GANTT_CHART_GAP_SIZE, GANTT_CHART_CELL_SIZE } from '../../../../../utils/gantt.utils';
import useId from '@mui/material/utils/useId';
import dayjs from 'dayjs';
import { Box, useTheme } from '@mui/material';
import { purple } from '@mui/material/colors';

interface GanttProps {
  start: Date;
  end: Date;
  tasks: Task[];
  isEditMode: boolean;
  setChanges: (eventChanges: EventChange[]) => void;
}

export function Gantt({ start, end, tasks, isEditMode, setChanges }: GanttProps) {
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));
  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);
  const createChange = (change: EventChange) => {
    setEventChanges([...eventChanges, change]);
  };

  useEffect(() => {
    setChanges(eventChanges);
    setEventChanges([]); // reset the changes after sending them
  }, [isEditMode]);

  const displayEvents = applyChangesToEvents(tasks, eventChanges);

  return (
    <Box sx={{ width: 'fit-content' }}>
      {/* Data display: reset list of events every time eventChanges list changes using key */}
      <Box sx={{ mt: '1rem', width: 'fit-content' }} key={eventChanges.length}>
        {displayEvents.map((event) => {
          return <Event key={event.id} days={days} event={event} isEditMode={isEditMode} createChange={createChange} />;
        })}
      </Box>
    </Box>
  );
}

function Event({
  days,
  event,
  createChange,
  isEditMode,
  ...props
}: { days: Date[]; event: Task; createChange: (change: EventChange) => void; isEditMode: boolean } & ComponentProps<'div'>) {
  const startCol = days.findIndex((day) => dateToString(day) === dateToString(event.start)) + 1;
  const endCol = days.findIndex((day) => dateToString(day) === dateToString(event.end)) + 2;

  const id = useId() || 'id'; // id for creating event changes
  const [measureRef, bounds] = useMeasure();
  const [initialWidth, setInitialWidth] = useState(0); // original width of the component, should not change on resize
  const [width, setWidth] = useState(0); // current width of component, will change on resize

  const theme = useTheme();

  // used to make sure that any changes to the start and end dates are made in multiples of 7
  const roundToMultipleOf7 = (num: number) => {
    return Math.round(num / 7) * 7;
  };

  useEffect(() => {
    if (bounds.width !== 0 && width === 0) {
      setInitialWidth(bounds.width);
      setWidth(bounds.width);
    }
  }, [bounds, width]);

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
      // Use change in width to calculate new length
      const newEventLengthInDays = roundToMultipleOf7(Math.round((lengthInDays / initialWidth) * width));
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
    const days = roundToMultipleOf7(differenceInDays(day, event.start));
    createChange({ id, eventId: event.id, type: 'shift-by-days', days });
  };

  return (
    <Box style={{ position: 'relative', width: '100%', marginTop: 10 }}>
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gap: GANTT_CHART_GAP_SIZE,
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
                height: '2.75rem',
                minWidth: GANTT_CHART_CELL_SIZE,
                maxWidth: GANTT_CHART_CELL_SIZE,
                backgroundColor: `color-mix(in srgb, ${theme.palette.background.default}, transparent 75%);`
              }}
            />
          ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: GANTT_CHART_GAP_SIZE,
          gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${days.length}, minmax(${GANTT_CHART_CELL_SIZE}, 1fr))`,
          width: '100%'
        }}
      >
        <div
          ref={measureRef}
          {...props}
          style={{
            gridColumnStart: startCol,
            gridColumnEnd: endCol,
            height: '2.75rem',
            width: width === 0 ? `unset` : `${width}px`,
            border: `1px solid ${isResizing ? theme.palette.text.primary : theme.palette.divider}`,
            borderRadius: '0.25rem',
            backgroundColor: event.styles ? event.styles.backgroundColor : purple[300]
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
              draggable={isEditMode}
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
              {event.name} ({dayjs(event.start).format('MMM D')}-{dayjs(event.end).format('MMM D')})
            </Box>
            {isEditMode && (
              <Box
                sx={{ cursor: 'ew-resize', height: '100%', width: '5rem', position: 'relative', right: '-10' }}
                onMouseDown={handleMouseDown}
              />
            )}
          </Box>
        </div>
      </Box>
    </Box>
  );
}
