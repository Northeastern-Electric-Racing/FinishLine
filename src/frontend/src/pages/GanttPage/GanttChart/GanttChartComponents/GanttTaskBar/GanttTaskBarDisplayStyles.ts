import { CSSProperties } from 'react';
import { GanttTask } from '../../../../../utils/gantt.utils';

// A single grid cell the width of the chart; everything in the row stacks in that cell at its own offset
export const ganttTaskBarBackgroundStyles = (chartWidthPx: number): CSSProperties => {
  return {
    width: chartWidthPx,
    display: 'grid',
    gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
    gridTemplateColumns: `${chartWidthPx}px`
  };
};

// Places an element inside the row at its pixel position on the chart
export const ganttElementPositionStyles = ({ left, width }: { left: number; width: number }): CSSProperties => {
  return {
    gridRow: 1,
    gridColumn: 1,
    justifySelf: 'start',
    marginLeft: left,
    width
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
