import React from 'react';
import styles from './bar.module.css';

type BarProgressHandleProps = {
  progressPoint: string;
  onMouseDown: (event: React.MouseEvent<SVGPolygonElement, MouseEvent>) => void;
};
export const BarProgressHandle = ({ progressPoint, onMouseDown }: BarProgressHandleProps) => {
  return <polygon className={styles.barHandle} points={progressPoint} onMouseDown={onMouseDown} />;
};
