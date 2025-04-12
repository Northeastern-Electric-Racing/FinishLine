import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import {
  GanttEvent,
  GanttTask,
  HighlightTaskComparator,
  isHighlightedChangeOnGanttTask,
  RequestEventChange
} from '../../../../../utils/gantt.utils';
import { addWeeksToDate, wbsPipe } from 'shared';
import {
  ganttTaskBarBackgroundStyles,
  ganttTaskBarContainerStyles,
  taskNameContainerStyles,
  webKitBoxContainerStyles,
  webKitBoxStyles
} from './GanttTaskBarDisplayStyles';
import { CSSProperties } from 'react';
import { ArcherElement } from 'react-archer';

interface GanttTaskBarDisplayProps<T> {
  days: Date[];
  task: GanttTask<T>;
  handleOnMouseOver: (e: React.MouseEvent, task: GanttTask<T>) => void;
  handleOnMouseLeave: () => void;
  onShowChildrenToggle: () => void;
  highlightedChange?: RequestEventChange<T>;
  showChildren?: boolean;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const GanttTaskBarDisplay = <T,>({
  days,
  task,
  handleOnMouseOver,
  handleOnMouseLeave,
  onShowChildrenToggle,
  showChildren,
  highlightedChange,
  getStartCol,
  getEndCol,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttTaskBarDisplayProps<T>) => {
  const theme = useTheme();
  const hasChildren = task.children.length > 0;

  const ganttTaskBarHoverDetectionBoxStyles: CSSProperties = {
    gridColumnStart: getStartCol(task.start),
    gridColumnEnd: getEndCol(task.end),
    height: '2rem',
    border: highlightedChange ? `1px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
    cursor: 'pointer',
    gridRow: 1,
    zIndex: 1
  };

  const ganttTaskBarDetailsBoxStyles: CSSProperties = {
    gridRow: 1,
    zIndex: 3,
    gridColumnStart: getStartCol(task.start),
    gridColumnEnd: getEndCol(task.end),
    display: 'flex',
    alignItems: 'center',
    marginTop: hasChildren ? '-10px' : undefined,
    marginBottom: hasChildren ? '-10px' : undefined,
    cursor: 'pointer',
    width: hasChildren ? 'fit-content' : '100%'
  };

  const ganttTaskBarChildOverlayStyles = (child: GanttTask<T>): CSSProperties => {
    return {
      gridColumnStart: getStartCol(child.start),
      gridColumnEnd: getEndCol(child.end),
      height: '2rem',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: '0.25rem',
      backgroundColor: child.styles ? child.styles.backgroundColor : grey[700],
      cursor: 'pointer',
      gridRow: 1,
      zIndex: 2
    };
  };

  const ganttTaskBarEventOverlayStyles = (event: GanttEvent): CSSProperties => {
    return {
      gridColumnStart: getStartCol(event.date),
      gridColumnEnd: getEndCol(addWeeksToDate(event.date, 1)),
      height: '2rem',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: '0.25rem',
      backgroundColor: event.color,
      cursor: 'pointer',
      gridRow: 1,
      zIndex: 2
    };
  };

  const highlightedChangeBoxStyles = (highlightedChange: RequestEventChange<T>): CSSProperties => {
    return {
      paddingTop: '2px',
      paddingLeft: '5px',
      gridColumnStart: getStartCol(highlightedChange.newStart),
      gridColumnEnd: getEndCol(highlightedChange.newEnd),
      height: '2rem',
      border: `1px solid ${theme.palette.text.primary}`,
      borderRadius: '0.25rem',
      backgroundColor: '#ef4345',
      cursor: 'pointer',
      gridRow: 1,
      zIndex: 6
    };
  };

  return (
    <div id={task.id} style={ganttTaskBarContainerStyles()}>
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
          <div
            style={ganttTaskBarHoverDetectionBoxStyles}
            onMouseOver={(e) => handleOnMouseOver(e, task)}
            onMouseLeave={handleOnMouseLeave}
            onClick={task.onClick}
          >
            <Box sx={webKitBoxContainerStyles()}>
              <Box sx={webKitBoxStyles()} />
            </Box>
          </div>
        </ArcherElement>
        <div
          style={ganttTaskBarDetailsBoxStyles}
          onMouseOver={(e) => handleOnMouseOver(e, task)}
          onMouseLeave={handleOnMouseLeave}
          onClick={task.onClick}
        >
          {hasChildren && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onShowChildrenToggle();
              }}
              sx={{ marginRight: '-15px', marginLeft: '-5px' }}
            >
              {showChildren ? (
                <ArrowDropDownIcon fontSize="large" />
              ) : (
                <ArrowDropDownIcon fontSize="large" sx={{ transform: `rotate(270deg)` }} />
              )}
            </IconButton>
          )}
          <Typography variant="body1" sx={taskNameContainerStyles(task)} onClick={onShowChildrenToggle}>
            {task.name}
          </Typography>
        </div>
        {hasChildren &&
          task.children.map((childTask) => {
            return (
              <div
                style={ganttTaskBarChildOverlayStyles(childTask)}
                onMouseOver={(e) => handleOnMouseOver(e, childTask)}
                onMouseLeave={handleOnMouseLeave}
                onClick={childTask.onClick}
              />
            );
          })}
        {task.events.map((event) => {
          return (
            <div
              style={ganttTaskBarEventOverlayStyles(event)}
              onMouseOver={(e) => handleOnMouseOver(e, task)}
              onMouseLeave={handleOnMouseLeave}
              onClick={event.onClick}
            >
              <Typography variant="body1" sx={taskNameContainerStyles(task)} onClick={event.onClick}>
                {event.name}
              </Typography>
            </div>
          );
        })}
        {highlightedChange &&
          (task.root
            ? isHighlightedChangeOnGanttTask(highlightedChange, task, highlightTaskComparator)
            : isHighlightedChangeOnGanttTask(highlightedChange, task, highlightSubtaskComparator)) && (
            <div id="proposedChange" style={highlightedChangeBoxStyles(highlightedChange)}>
              <Typography
                variant="body1"
                sx={{
                  color: task.styles ? task.styles.color : '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {task.name}
              </Typography>
            </div>
          )}
      </Box>
    </div>
  );
};

export default GanttTaskBarDisplay;
