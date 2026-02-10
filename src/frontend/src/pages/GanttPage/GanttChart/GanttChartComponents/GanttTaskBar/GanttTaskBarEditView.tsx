import { Box, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/system';
import { CSSProperties, DragEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import { addDaysToDate } from 'shared';
import { GanttChange, GanttTask, GANTT_CHART_CELL_SIZE } from '../../../../../utils/gantt.utils';
import { differenceInDays } from 'date-fns';
import {
  ganttTaskBarBackgroundStyles,
  ganttTaskBarContainerStyles,
  taskNameContainerStyles,
  webKitBoxContainerStyles,
  webKitBoxStyles
} from './GanttTaskBarDisplayStyles';
import { ArcherElement } from 'react-archer';
import { v4 as uuidv4 } from 'uuid';

interface GanttTaskBarEditProps<T> {
  days: Date[];
  task: GanttTask<T>;
  createChange: (change: GanttChange<T>) => void;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
}

export const GanttTaskBarEditView = <T,>({
  days,
  task,
  createChange,
  getStartCol,
  getEndCol,
  onAddTaskPressed
}: GanttTaskBarEditProps<T>) => {
  const theme = useTheme();
  const [showDropPoints, setShowDropPoints] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(0);
  const [correctWidth, setCorrectWidth] = useState(0);
  const [measureRef, bounds] = useMeasure();
  const hasMeasuredRef = useRef(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const widthPerDay = 7.2; //width per day to use for resizing calculations, kind of arbitrary,

  const taskBarDisplayStyles: CSSProperties = {
    gridColumnStart: getStartCol(task.start),
    gridColumnEnd: getEndCol(task.end),
    height: '2rem',
    width: task.root ? 'unset' : correctWidth > 0 ? `${correctWidth}px` : 'auto',
    border: `1px solid ${isResizing ? theme.palette.text.primary : theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
    cursor: task.root ? 'default' : 'move'
  };

  const dropPointCellStyles: CSSProperties = {
    borderRadius: '0.25rem',
    height: '2rem',
    minWidth: GANTT_CHART_CELL_SIZE,
    maxWidth: GANTT_CHART_CELL_SIZE,
    backgroundColor: `color-mix(in srgb, ${theme.palette.background.default}, transparent 75%);`
  };

  const hoverContainerBoxStyles: CSSProperties = {
    cursor: task.root ? 'default' : 'ew-resize',
    height: '100%',
    width: '5rem',
    position: 'relative',
    right: '-10'
  };

  const getCorrectWidth = useCallback((rawWidth: number) => {
    const newEventLengthInDays = roundToMultipleOf7(rawWidth / widthPerDay);
    const displayWeeks = newEventLengthInDays / 7 + 1;
    return displayWeeks * 40 + (displayWeeks - 1) * 10;
  }, []);

  useEffect(() => {
    if (!hasMeasuredRef.current && bounds.width > 0) {
      setWidth(bounds.width);
      setCorrectWidth(getCorrectWidth(bounds.width));
      hasMeasuredRef.current = true;
    }
  }, [bounds.width, getCorrectWidth]);

  // used to make sure that any changes to the start and end dates are made in multiples of 7
  const roundToMultipleOf7 = (num: number) => {
    return Math.ceil(num / 7) * 7;
  };

  const getDistanceFromLeft = (clientX: number) => {
    const rect = boxRef.current!.getBoundingClientRect();
    return clientX - rect.left;
  };

  const handleMouseDown = (e: MouseEvent<HTMLElement>) => {
    setIsResizing(true);
    boxRef.current = (e.currentTarget as HTMLElement).closest('[data-gantt-bar]') as HTMLDivElement;
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!isResizing) return;

    const newWidth = Math.max(100, getDistanceFromLeft(e.clientX));

    setWidth(newWidth); // sync render
    setCorrectWidth(getCorrectWidth(newWidth));
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      const newEventLengthInDays = roundToMultipleOf7(width / widthPerDay);
      createChange({
        id: uuidv4(),
        element: task.element,
        type: 'change-end-date',
        originalEnd: task.end,
        newEnd: addDaysToDate(task.start, newEventLengthInDays)
      });
    }
  };

  const onDragStart = () => {
    setShowDropPoints(true);
  };
  const onDragEnd = () => {
    setShowDropPoints(false);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDrop = (day: Date) => {
    const days = roundToMultipleOf7(differenceInDays(day, task.start));
    createChange({ id: uuidv4(), element: task.element, type: 'shift-by-days', days });
  };

  return (
    <div style={ganttTaskBarContainerStyles()} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      <Box
        sx={{
          ...ganttTaskBarBackgroundStyles(days.length),
          position: 'absolute', // These will make it so that the bar stays on top of the drop points, i kind of like it going to a new line though
          top: 0,
          left: 0
        }}
      >
        {/* Drop areas */}
        {showDropPoints &&
          days.map((day, index) => (
            <Box key={index} onDragOver={onDragOver} onDrop={() => onDrop(day)} sx={dropPointCellStyles} />
          ))}
      </Box>
      <Box sx={ganttTaskBarBackgroundStyles(days.length)}>
        <ArcherElement
          id={task.id}
          relations={task.blocking.map((blocking) => {
            return {
              targetId: blocking.id,
              targetAnchor: 'left',
              sourceAnchor: 'right',
              style: { strokeDasharray: '5,5', noCurves: true, endMarker: false }
            };
          })}
        >
          <div data-gantt-bar ref={measureRef} style={taskBarDisplayStyles}>
            <Box sx={webKitBoxContainerStyles()}>
              <Box draggable={!task.root} onDrag={onDragStart} onDragEnd={onDragEnd} sx={webKitBoxStyles()}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Typography variant="body1" sx={taskNameContainerStyles(task)}>
                    {task.name}
                  </Typography>
                </Box>
              </Box>

              <Box sx={hoverContainerBoxStyles} onMouseDown={task.root ? undefined : handleMouseDown} />
            </Box>
          </div>
        </ArcherElement>
        {task.root && <Chip label={'+'} onClick={() => onAddTaskPressed(task)} />}
      </Box>
    </div>
  );
};
