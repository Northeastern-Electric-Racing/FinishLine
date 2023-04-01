import React from 'react';
import { TaskItemProps } from '../task-item';
import styles from './project.module.css';

export const Project: React.FC<TaskItemProps> = ({ task, isSelected }) => {
  const barColor = isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
  const projectWidth = task.x2 - task.x1;

  return (
    <g tabIndex={0} className={styles.projectWrapper}>
      <rect
        fill={barColor}
        x={task.x1}
        width={projectWidth || 0}
        y={task.y}
        height={task.height}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
        className={styles.projectBackground}
      />
      {task.barChildren.map((child) => {
        return (
          <rect
            x={child.x1}
            width={child.x2 - child.x1}
            y={task.y}
            height={task.height}
            ry={task.barCornerRadius}
            rx={task.barCornerRadius}
            fill={child.styles.backgroundColor}
          />
        );
      })}
    </g>
  );
};
