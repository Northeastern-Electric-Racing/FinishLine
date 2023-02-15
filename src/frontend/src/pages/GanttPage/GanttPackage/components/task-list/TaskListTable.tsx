import React from 'react';
import styles from '../../../../../stylesheets/pages/gantt-page.module.css';
import { Task } from '../../types/public-types';

export type TaskListHeaderDefaultProps = {
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
};

export const TaskListTableDefault = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  onExpanderClick
}: TaskListHeaderDefaultProps) => {
  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize
      }}
    >
      {tasks.map((t) => {
        let expanderSymbol = '';
        if (t.hideChildren === false) {
          expanderSymbol = '▼';
        } else if (t.hideChildren) {
          expanderSymbol = '▶';
        }

        return (
          <div className={styles.taskListTableRow} style={{ height: rowHeight }} key={`${t.id}row`}>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth
              }}
              title={t.name}
            >
              <div className={styles.taskListNameWrapper}>
                <div
                  className={expanderSymbol ? styles.taskListExpander : styles.taskListEmptyExpander}
                  onClick={() => onExpanderClick(t)}
                >
                  {expanderSymbol}
                </div>
                <div className={styles.taskListNameText}>{t.name}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
