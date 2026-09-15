import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import {
  GanttEvent,
  GanttTask,
  HighlightTaskComparator,
  isHighlightedChangeOnGanttTask,
  OnMouseOverOptions,
  RequestEventChange,
  GANTT_CHART_CELL_SIZE,
  GANTT_CHART_GAP_SIZE
} from '../../../../../utils/gantt.utils';
import { addWeeksToDate } from 'shared';
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
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
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
  const hasOverlays = task.overlays.length > 0;

  const ganttTaskBarHoverDetectionBoxStyles: CSSProperties = {
    gridColumnStart: getStartCol(task.start),
    gridColumnEnd: getEndCol(task.end),
    height: '2rem',
    border: highlightedChange ? `1px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
    cursor: 'pointer',
    gridRow: 1
  };

  const ganttTaskBarDetailsBoxStyles: CSSProperties = {
    gridRow: 1,
    zIndex: 3,
    gridColumnStart: getStartCol(task.start),
    gridColumnEnd: getEndCol(task.end),
    display: 'flex',
    alignItems: 'center',
    marginTop: hasOverlays ? '-10px' : undefined,
    marginBottom: hasOverlays ? '-10px' : undefined,
    cursor: 'pointer',
    position: 'sticky',
    left: 0,
    width: hasOverlays ? 'fit-content' : '100%'
  };

  const ganttTaskBarChildOverlayStyles = (child: GanttTask<T>): CSSProperties => {
    return {
      position: 'absolute',
      left: `calc(${getStartCol(child.start) - 1} * (${GANTT_CHART_CELL_SIZE} + ${GANTT_CHART_GAP_SIZE}))`,
      width: `calc(${getEndCol(child.end) - getStartCol(child.start)} * (${GANTT_CHART_CELL_SIZE} + ${GANTT_CHART_GAP_SIZE}) - ${GANTT_CHART_GAP_SIZE})`,
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
      zIndex: 5
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

  const retroOverlayBoxStyles = (retro: { comparativeStart?: Date; comparativeEnd?: Date }): CSSProperties => {
    if (!retro.comparativeStart || !retro.comparativeEnd) {
      return {};
    }

    return {
      paddingTop: '2px',
      paddingLeft: '5px',
      gridColumnStart: getStartCol(retro.comparativeStart),
      gridColumnEnd: getEndCol(retro.comparativeEnd),
      height: '2rem',
      border: `1px solid ${theme.palette.text.primary}`,
      borderRadius: '0.25rem',
      backgroundImage: `
        repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 10px)
      `,
      backgroundColor: grey[100],
      opacity: 0.3,
      cursor: 'pointer',
      gridRow: 1,
      zIndex: 1
    };
  };

  return (
    <div style={ganttTaskBarContainerStyles()}>
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
              <div
                style={ganttTaskBarDetailsBoxStyles}
                onMouseOver={(e) => handleOnMouseOver(e, task)}
                onMouseLeave={handleOnMouseLeave}
                onClick={task.onClick}
              >
                {hasOverlays && (
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
              {hasOverlays &&
                task.children.map((childTask) => {
                  return (
                    <div
                      style={ganttTaskBarChildOverlayStyles(childTask)}
                      onMouseOver={(e) => {
                        e.stopPropagation();
                        handleOnMouseOver(e, childTask);
                      }}
                      onMouseLeave={handleOnMouseLeave}
                      onClick={childTask.onClick}
                    />
                  );
                })}
              <Box sx={webKitBoxStyles()} />
            </Box>
          </div>
        </ArcherElement>

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
        {task.retro && (
          <div
            id="retro"
            onMouseEnter={(e) =>
              handleOnMouseOver(e, {
                ...task,
                name: 'Original ' + task.name,
                start: task.retro?.comparativeStart,
                end: task.retro?.comparativeEnd
              })
            }
            onMouseLeave={handleOnMouseLeave}
            style={retroOverlayBoxStyles(task.retro)}
          ></div>
        )}
      </Box>
    </div>
  );
};

export default GanttTaskBarDisplay;
