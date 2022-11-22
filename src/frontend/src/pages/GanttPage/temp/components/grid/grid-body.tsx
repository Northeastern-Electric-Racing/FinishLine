import React, { ReactChild } from 'react';
import { Task } from '../../types/public-types';
import { addToDate } from '../../helpers/date-helper';
import styles from './grid.module.css';

export type GridBodyProps = {
  tasks: Task[];
  dates: Date[];
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  todayColor: string;
  rtl: boolean;
};
export const GridBody: React.FC<GridBodyProps> = ({ tasks, dates, rowHeight, svgWidth, columnWidth, todayColor, rtl }) => {
  let y = 0;
  const gridRows: ReactChild[] = [];
  for (const task of tasks) {
    gridRows.push(
      <rect key={'Row' + task.name + task.id} x="0" y={y} width={svgWidth} height={rowHeight} className={styles.gridRow} />
    );
    y += rowHeight;
  }

  const now = new Date();
  let tickX = 0;
  const ticks: ReactChild[] = [];
  let today: ReactChild = <rect />;
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(<line key={date.getTime()} x1={tickX} y1={0} x2={tickX} y2={y} className={styles.gridTick} />);
    if (
      (i + 1 !== dates.length && date.getTime() < now.getTime() && dates[i + 1].getTime() >= now.getTime()) ||
      // if current date is last
      (i !== 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addToDate(date, date.getTime() - dates[i - 1].getTime(), 'millisecond').getTime() >= now.getTime())
    ) {
      today = <rect x={tickX} y={0} width={columnWidth} height={y} fill={todayColor} />;
    }
    // rtl for today
    if (rtl && i + 1 !== dates.length && date.getTime() >= now.getTime() && dates[i + 1].getTime() < now.getTime()) {
      today = <rect x={tickX + columnWidth} y={0} width={columnWidth} height={y} fill={todayColor} />;
    }
    tickX += columnWidth;
  }
  return (
    <g className="gridBody">
      <g className="rows">{gridRows}</g>
      <g className="ticks">{ticks}</g>
      <g className="today">{today}</g>
    </g>
  );
};
