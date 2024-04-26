/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { addDays, differenceInDays } from 'date-fns';
import { ComponentProps, DragEvent, MouseEvent, useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';
import { GANTT_CHART_GAP_SIZE, GANTT_CHART_CELL_SIZE, EventChange, GanttTaskData } from '../../../utils/gantt.utils';
import useId from '@mui/material/utils/useId';
import { Box, Typography, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { dateToString } from '../../../utils/datetime.utils';
import { routes } from '../../../utils/routes';
import { useHistory } from 'react-router-dom';
import GanttToolTip from './GanttToolTip';

const GanttTaskBar = ({
  days,
  event,
  createChange,
  isEditMode,
  ...props
}: {
  days: Date[];
  event: GanttTaskData;
  createChange: (change: EventChange) => void;
  isEditMode: boolean;
} & ComponentProps<'div'>) => {
  const theme = useTheme();
  const id = useId() || 'id'; // id for creating event changes
  const history = useHistory();
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const [showDropPoints, setShowDropPoints] = useState(false);
  const [initialWidth, setInitialWidth] = useState(0); // original width of the component, should not change on resize
  const [width, setWidth] = useState(0); // current width of component, will change on resize
  const [measureRef, bounds] = useMeasure();
  const [showPopup, setShowPopup] = useState(false);
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);
  const startCol = days.findIndex((day) => dateToString(day) === dateToString(event.start)) + 1;

  // if the end date doesn't exist within the timeframe, have it span to the end
  const endCol =
    days.findIndex((day) => dateToString(day) === dateToString(event.end)) === -1
      ? days.length + 1
      : days.findIndex((day) => dateToString(day) === dateToString(event.end)) + 2;

  const lengthInDays = differenceInDays(event.end, event.start);

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

  const handleOnMouseOver = (e: React.MouseEvent) => {
    if (!isEditMode) {
      setCursorX(e.clientX);
      setCursorY(e.clientY);
      setShowPopup(true);
    }
  };

  const handleOnMouseLeave = () => {
    setShowPopup(false);
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
                height: '2rem',
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
            height: '2rem',
            width: width === 0 ? `unset` : `${width}px`,
            border: `1px solid ${isResizing ? theme.palette.text.primary : theme.palette.divider}`,
            borderRadius: '0.25rem',
            backgroundColor: event.styles ? event.styles.backgroundColor : grey[700],
            cursor: isEditMode ? 'move' : 'pointer'
          }}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseOver={handleOnMouseOver}
          onMouseLeave={handleOnMouseLeave}
          onClick={() => history.push(`${`${routes.PROJECTS}/${event.id}`}`)}
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
              <Typography variant="body1" sx={{ color: event.styles ? event.styles.color : '#ffffff', px: 1 }}>
                {event.name}
              </Typography>
            </Box>
            {isEditMode && (
              <Box
                sx={{ cursor: 'ew-resize', height: '100%', width: '5rem', position: 'relative', right: '-10' }}
                onMouseDown={handleMouseDown}
              />
            )}
            {showPopup && (
              <GanttToolTip
                xCoordinate={cursorX}
                yCoordinate={cursorY}
                title={event.name}
                startDate={event.start}
                endDate={event.end}
                color={event.styles?.backgroundColor}
              />
            )}
          </Box>
        </div>
      </Box>
    </Box>
  );
};

export default GanttTaskBar;
