import { Box, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/system';
import { CSSProperties, DragEvent, MouseEvent, useRef, useState } from 'react';
import { addDaysToDate } from 'shared';
import {
  GanttChange,
  GanttScale,
  GanttTask,
  GanttTimeUnit,
  GANTT_EDIT_SNAP_DAYS,
  getColumns,
  getDateOffsetPx,
  getElementPositionPx
} from '../../../../../utils/gantt.utils';
import { differenceInDays } from 'date-fns';
import {
  ganttElementPositionStyles,
  ganttTaskBarBackgroundStyles,
  ganttTaskBarContainerStyles,
  taskNameContainerStyles,
  webKitBoxContainerStyles,
  webKitBoxStyles
} from './GanttTaskBarDisplayStyles';
import { ArcherElement } from 'react-archer';
import { v4 as uuidv4 } from 'uuid';

interface GanttTaskBarEditProps<T> {
  scale: GanttScale;
  task: GanttTask<T>;
  createChange: (change: GanttChange<T>) => void;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
}

// used to make sure that any changes to the start and end dates are made in whole weeks
const roundToSnap = (days: number) => Math.round(days / GANTT_EDIT_SNAP_DAYS) * GANTT_EDIT_SNAP_DAYS;
const ceilToSnap = (days: number) => Math.ceil(days / GANTT_EDIT_SNAP_DAYS) * GANTT_EDIT_SNAP_DAYS;

export const GanttTaskBarEditView = <T,>({ scale, task, createChange, onAddTaskPressed }: GanttTaskBarEditProps<T>) => {
  const theme = useTheme();
  const [showDropPoints, setShowDropPoints] = useState(false);
  // length of the bar while it is being resized, in days
  const [resizeDays, setResizeDays] = useState<number | undefined>(undefined);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const isResizing = resizeDays !== undefined;

  const position = getElementPositionPx(task.start, isResizing ? addDaysToDate(task.start, resizeDays) : task.end, scale);

  const taskBarDisplayStyles: CSSProperties = {
    ...ganttElementPositionStyles(position),
    height: '2rem',
    border: `1px solid ${isResizing ? theme.palette.text.primary : theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
    cursor: task.root ? 'default' : 'move'
  };

  const dropPointCellStyles = (weekStart: Date): CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: getDateOffsetPx(weekStart, scale.start, scale.pixelsPerDay) + 1,
    width: GANTT_EDIT_SNAP_DAYS * scale.pixelsPerDay - 2,
    borderRadius: '0.25rem',
    height: '2rem',
    backgroundColor: `color-mix(in srgb, ${theme.palette.background.default}, transparent 75%);`
  });

  const addTaskChipStyles: CSSProperties = {
    gridRow: 1,
    gridColumn: 1,
    justifySelf: 'start',
    alignSelf: 'center',
    marginLeft: position.left + position.width + 8
  };

  const hoverContainerBoxStyles: CSSProperties = {
    cursor: task.root ? 'default' : 'ew-resize',
    height: '100%',
    width: '5rem',
    position: 'relative',
    right: '-10'
  };

  const getDistanceFromLeft = (clientX: number) => {
    if (!boxRef.current) return 0;
    const rect = boxRef.current.getBoundingClientRect();
    return clientX - rect.left;
  };

  const handleMouseDown = (e: MouseEvent<HTMLElement>) => {
    const bar = (e.currentTarget as HTMLElement).closest('[data-gantt-bar]');
    if (!bar) return;

    boxRef.current = bar as HTMLDivElement;
    setResizeDays(differenceInDays(task.end, task.start));
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!isResizing) return;

    const days = getDistanceFromLeft(e.clientX) / scale.pixelsPerDay;
    setResizeDays(Math.max(GANTT_EDIT_SNAP_DAYS, roundToSnap(days)));
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setResizeDays(undefined);
      if (resizeDays === differenceInDays(task.end, task.start)) return;
      createChange({
        id: uuidv4(),
        element: task.element,
        type: 'change-end-date',
        originalEnd: task.end,
        newEnd: addDaysToDate(task.start, resizeDays)
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
  const onDrop = (weekStart: Date) => {
    const days = ceilToSnap(differenceInDays(weekStart, task.start));
    createChange({ id: uuidv4(), element: task.element, type: 'shift-by-days', days });
  };

  return (
    <div style={ganttTaskBarContainerStyles()} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      {/* Drop areas, one per week. Positioned absolutely so the bar stays on top of them */}
      {showDropPoints &&
        getColumns(scale.start, scale.end, GanttTimeUnit.Week).map((weekStart) => (
          <Box
            key={weekStart.toISOString()}
            onDragOver={onDragOver}
            onDrop={() => onDrop(weekStart)}
            sx={dropPointCellStyles(weekStart)}
          />
        ))}
      <Box sx={ganttTaskBarBackgroundStyles(scale.widthPx)}>
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
          <div data-gantt-bar style={taskBarDisplayStyles}>
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
        {task.root && <Chip label={'+'} onClick={() => onAddTaskPressed(task)} sx={addTaskChipStyles} />}
      </Box>
    </div>
  );
};
