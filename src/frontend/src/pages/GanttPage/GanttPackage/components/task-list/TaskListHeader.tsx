import React from 'react';
import styles from '../../../../../stylesheets/pages/gantt-page.module.css';

export type TaskListHeaderDefaultProps = {
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
};

export const TaskListHeaderDefault = ({ headerHeight, fontFamily, fontSize, rowWidth }: TaskListHeaderDefaultProps) => {
  return (
    <div
      className={styles.ganttTable}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize
      }}
    >
      <div
        className={styles.ganttTable_Header}
        style={{
          height: headerHeight - 2
        }}
      >
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth
          }}
        >
          &nbsp;Name
        </div>
      </div>
    </div>
  );
};
