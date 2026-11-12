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
  GanttScale,
  getElementPositionPx
} from '../../../../../utils/gantt.utils';
import { addWeeksToDate } from 'shared';
import {
  ganttElementPositionStyles,
  ganttTaskBarBackgroundStyles,
  ganttTaskBarContainerStyles,
  taskNameContainerStyles,
  webKitBoxContainerStyles,
  webKitBoxStyles
} from './GanttTaskBarDisplayStyles';
import { CSSProperties } from 'react';
import { ArcherElement } from 'react-archer';

interface GanttTaskBarDisplayProps<T> {
  scale: GanttScale;
  task: GanttTask<T>;
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
  handleOnMouseLeave: () => void;
  onShowChildrenToggle: () => void;
  highlightedChange?: RequestEventChange<T>;
  isExpanded: boolean;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const GanttTaskBarDisplay = <T,>({
  scale,
  task,
  handleOnMouseOver,
  handleOnMouseLeave,
  onShowChildrenToggle,
  isExpanded,
  highlightedChange,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttTaskBarDisplayProps<T>) => {
  const theme = useTheme();
  const hasOverlays = task.overlays.length > 0;

  const taskPosition = getElementPositionPx(task.start, task.end, scale);

  const ganttTaskBarHoverDetectionBoxStyles: CSSProperties = {
    ...ganttElementPositionStyles(taskPosition),
    height: '2rem',
    border: highlightedChange ? `1px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
    cursor: 'pointer'
  };

  const ganttTaskBarDetailsBoxStyles: CSSProperties = {
    zIndex: 3,
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
    const { left, width } = getElementPositionPx(child.start, child.end, scale);
    return {
      position: 'absolute',
      left,
      width,
      height: '2rem',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: '0.25rem',
      backgroundColor: child.styles ? child.styles.backgroundColor : grey[700],
      cursor: 'pointer',
      zIndex: 2
    };
  };

  const ganttTaskBarEventOverlayStyles = (event: GanttEvent): CSSProperties => {
    return {
      ...ganttElementPositionStyles(getElementPositionPx(event.date, addWeeksToDate(event.date, 1), scale)),
      height: '2rem',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: '0.25rem',
      backgroundColor: event.color,
      cursor: 'pointer',
      zIndex: 5
    };
  };

  const highlightedChangeBoxStyles = (highlightedChange: RequestEventChange<T>): CSSProperties => {
    return {
      paddingTop: '2px',
      paddingLeft: '5px',
      ...ganttElementPositionStyles(getElementPositionPx(highlightedChange.newStart, highlightedChange.newEnd, scale)),
      height: '2rem',
      border: `1px solid ${theme.palette.text.primary}`,
      borderRadius: '0.25rem',
      backgroundColor: '#ef4345',
      cursor: 'pointer',
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
      ...ganttElementPositionStyles(getElementPositionPx(retro.comparativeStart, retro.comparativeEnd, scale)),
      height: '2rem',
      border: `1px solid ${theme.palette.text.primary}`,
      borderRadius: '0.25rem',
      backgroundImage: `
        repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 10px)
      `,
      backgroundColor: grey[100],
      opacity: 0.3,
      cursor: 'pointer',
      zIndex: 1
    };
  };

  return (
    <div style={ganttTaskBarContainerStyles()}>
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
                    {isExpanded ? (
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
