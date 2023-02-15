import React from 'react';
import styles from './bar.module.css';

type BarDateHandleProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  barCornerRadius: number;
  onMouseDown: (event: React.MouseEvent<SVGRectElement, MouseEvent>) => void;
};
export const BarDateHandle = ({ x, y, width, height, barCornerRadius, onMouseDown }: BarDateHandleProps) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      className={styles.barHandle}
      ry={barCornerRadius}
      rx={barCornerRadius}
      onMouseDown={onMouseDown}
    />
  );
};
