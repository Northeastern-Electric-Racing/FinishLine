import { CSSProperties } from 'react';
import { GanttTask, GANTT_CHART_CELL_SIZE, GANTT_CHART_GAP_SIZE } from '../../../../utils/gantt.utils';

export const ganttTaskBarBackgroundStyles = (numDays: number): CSSProperties => {
  return {
    width: '100%',
    display: 'grid',
    gap: GANTT_CHART_GAP_SIZE,
    gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
    gridTemplateColumns: `repeat(${numDays}, minmax(${GANTT_CHART_CELL_SIZE}, 1fr))`
    //  position: 'absolute', // These will make it so that the bar stays on top of the drop points, i kind of like it going to a new line though
    //  top: 0,
    //  left: 0
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

export const taskNameContainerStyles = (task: GanttTask): CSSProperties => {
  return {
    color: task.styles ? task.styles.color : '#ffffff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: '0.25rem'
  };
};
