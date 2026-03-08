import { CSSProperties } from 'react';
import { GanttTask, GANTT_CHART_CELL_SIZE, GANTT_CHART_GAP_SIZE } from '../../../../../utils/gantt.utils';

// Single row container — position: relative so absolute children are anchored to it.
// Width is the total chart width so the row spans the full timeline.
export const ganttTaskBarBackgroundStyles = (numDays: number): CSSProperties => {
  return {
    position: 'relative',
    height: '2rem',
    width: `calc(${numDays} * (${GANTT_CHART_CELL_SIZE} + ${GANTT_CHART_GAP_SIZE}) - ${GANTT_CHART_GAP_SIZE})`
  };
};

export const ganttTaskBarContainerStyles = (): CSSProperties => {
  return {
    position: 'relative',
    width: '100%',
    marginTop: 10
  };
};

export const webKitBoxContainerStyles = (): CSSProperties => {
  return {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'visible'
  };
};

export const webKitBoxStyles = (): CSSProperties => {
  return {
    padding: '0.25rem',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 1,
    userSelect: 'none'
  };
};

export const taskNameContainerStyles = <T>(task: GanttTask<T>): CSSProperties => {
  return {
    color: task.styles ? task.styles.color : '#ffffff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: '0.25rem'
  };
};
