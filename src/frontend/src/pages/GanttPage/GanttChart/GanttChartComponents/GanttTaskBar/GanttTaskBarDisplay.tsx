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
  taskNameContainerStyles
} from './GanttTaskBarDisplayStyles';
import { CSSProperties, memo, useMemo } from 'react';
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

const colToLeft = (startCol: number) => `calc(${startCol - 1} * (${GANTT_CHART_CELL_SIZE} + ${GANTT_CHART_GAP_SIZE}))`;

const colToWidth = (startCol: number, endCol: number) =>
  `calc(${endCol - startCol} * (${GANTT_CHART_CELL_SIZE} + ${GANTT_CHART_GAP_SIZE}) - ${GANTT_CHART_GAP_SIZE})`;

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

  const startCol = getStartCol(task.start);
  const endCol = getEndCol(task.end);

  const relations = useMemo(
    () =>
      task.blocking.map((blocking) => ({
        targetId: blocking.id,
        targetAnchor: 'left' as const,
        sourceAnchor: 'right' as const,
        style: { strokeDasharray: '5,5', noCurves: true, endMarker: false }
      })),
    [task.blocking]
  );

  // Shared absolute positioning for the main bar position
  const barPosition: CSSProperties = {
    position: 'absolute',
    left: colToLeft(startCol),
    width: colToWidth(startCol, endCol),
    height: '2rem'
  };

  // zIndex 1 — background color layer, sits below child overlays
  const ganttTaskBarBgStyles: CSSProperties = {
    ...barPosition,
    border: highlightedChange ? `1px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
    cursor: 'pointer',
    zIndex: 1,
    boxSizing: 'border-box'
  };

  // zIndex 3 — text/label layer, sits above child overlays (zIndex 2)
  const ganttTaskBarLabelStyles: CSSProperties = {
    ...barPosition,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 3,
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  const ganttTaskBarChildOverlayStyles = (child: GanttTask<T>): CSSProperties => ({
    position: 'absolute',
    left: colToLeft(getStartCol(child.start)),
    width: colToWidth(getStartCol(child.start), getEndCol(child.end)),
    height: '2rem',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: child.styles ? child.styles.backgroundColor : grey[700],
    cursor: 'pointer',
    zIndex: 2
  });

  const ganttTaskBarEventOverlayStyles = (event: GanttEvent): CSSProperties => ({
    position: 'absolute',
    left: colToLeft(getStartCol(event.date)),
    width: colToWidth(getStartCol(event.date), getEndCol(addWeeksToDate(event.date, 1))),
    height: '2rem',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: event.color,
    cursor: 'pointer',
    zIndex: 5
  });

  const highlightedChangeBoxStyles = (highlightedChange: RequestEventChange<T>): CSSProperties => ({
    position: 'absolute',
    left: colToLeft(getStartCol(highlightedChange.newStart)),
    width: colToWidth(getStartCol(highlightedChange.newStart), getEndCol(highlightedChange.newEnd)),
    paddingTop: '2px',
    paddingLeft: '5px',
    height: '2rem',
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: '0.25rem',
    backgroundColor: '#ef4345',
    cursor: 'pointer',
    zIndex: 6
  });

  const retroOverlayBoxStyles = (retro: { comparativeStart?: Date; comparativeEnd?: Date }): CSSProperties => {
    if (!retro.comparativeStart || !retro.comparativeEnd) return {};
    return {
      position: 'absolute',
      left: colToLeft(getStartCol(retro.comparativeStart)),
      width: colToWidth(getStartCol(retro.comparativeStart), getEndCol(retro.comparativeEnd)),
      paddingTop: '2px',
      paddingLeft: '5px',
      height: '2rem',
      border: `1px solid ${theme.palette.text.primary}`,
      borderRadius: '0.25rem',
      backgroundImage: `repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 10px)`,
      backgroundColor: grey[100],
      opacity: 0.3,
      cursor: 'pointer',
      zIndex: 1
    };
  };

  return (
    <div style={ganttTaskBarContainerStyles()}>
      <Box sx={ganttTaskBarBackgroundStyles(days.length)}>
        {/* Layer 1: background color bar — Archer anchors to this */}
        <ArcherElement id={task.id} relations={relations}>
          <div
            style={ganttTaskBarBgStyles}
            onMouseOver={(e) => handleOnMouseOver(e, task)}
            onMouseLeave={handleOnMouseLeave}
            onClick={task.onClick}
          />
        </ArcherElement>

        {/* Layer 2: child overlays — colored bars on top of background */}
        {hasOverlays &&
          task.children.map((childTask) => (
            <div
              key={childTask.id}
              style={ganttTaskBarChildOverlayStyles(childTask)}
              onMouseOver={(e) => {
                e.stopPropagation();
                handleOnMouseOver(e, childTask);
              }}
              onMouseLeave={handleOnMouseLeave}
              onClick={childTask.onClick}
            />
          ))}

        {/* Layer 3: text/label — on top of everything so it's always readable */}
        <div
          style={ganttTaskBarLabelStyles}
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
                <ArrowDropDownIcon fontSize="large" sx={{ transform: 'rotate(270deg)' }} />
              )}
            </IconButton>
          )}
          <Typography variant="body1" sx={taskNameContainerStyles(task)} onClick={onShowChildrenToggle}>
            {task.name}
          </Typography>
        </div>

        {/* Events */}
        {task.events.map((event) => (
          <div
            key={event.name}
            style={ganttTaskBarEventOverlayStyles(event)}
            onMouseOver={(e) => handleOnMouseOver(e, task)}
            onMouseLeave={handleOnMouseLeave}
            onClick={event.onClick}
          >
            <Typography variant="body1" sx={taskNameContainerStyles(task)} onClick={event.onClick}>
              {event.name}
            </Typography>
          </div>
        ))}

        {/* Highlighted change */}
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

        {/* Retro overlay */}
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
          />
        )}
      </Box>
    </div>
  );
};

export default memo(GanttTaskBarDisplay) as typeof GanttTaskBarDisplay;
