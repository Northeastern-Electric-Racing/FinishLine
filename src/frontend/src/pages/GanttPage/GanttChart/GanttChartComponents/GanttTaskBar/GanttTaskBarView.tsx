import {
  RequestEventChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions
} from '../../../../../utils/gantt.utils';
import { Collapse } from '@mui/material';
import GanttTaskBar from './GanttTaskBar';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';
import React from 'react';

const noop = () => {};

interface GanttTaskBarViewProps<T> {
  days: Date[];
  task: GanttTask<T>;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
  handleOnMouseLeave: () => void;
  highlightedChange?: RequestEventChange<T>;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
  onToggle?: () => void;
  toggleExpanded: (id: string) => void;
  isExpanded: boolean;
  expanded: Set<string>;
}

const GanttTaskBarView = <T,>({
  days,
  task,
  getStartCol,
  getEndCol,
  handleOnMouseOver,
  handleOnMouseLeave,
  highlightedChange,
  onAddTaskPressed,
  highlightSubtaskComparator,
  highlightTaskComparator,
  onToggle,
  toggleExpanded,
  isExpanded,
  expanded
}: GanttTaskBarViewProps<T>) => {
  const handleToggle = () => {
    toggleExpanded(task.id);
  };

  return (
    <>
      <GanttTaskBarDisplay
        days={days}
        task={task}
        handleOnMouseOver={handleOnMouseOver}
        handleOnMouseLeave={handleOnMouseLeave}
        isExpanded={isExpanded}
        onShowChildrenToggle={handleToggle}
        highlightedChange={highlightedChange}
        getStartCol={getStartCol}
        getEndCol={getEndCol}
        highlightSubtaskComparator={highlightSubtaskComparator}
        highlightTaskComparator={highlightTaskComparator}
      />

      <Collapse in={isExpanded} unmountOnExit onEntered={onToggle} onExited={onToggle}>
        {task.children.map((child) => (
          <GanttTaskBar
            key={child.id}
            days={days}
            task={child}
            isEditMode={false}
            createChange={noop}
            handleOnMouseOver={handleOnMouseOver}
            handleOnMouseLeave={handleOnMouseLeave}
            highlightedChange={highlightedChange}
            onAddTaskPressed={onAddTaskPressed}
            highlightSubtaskComparator={highlightSubtaskComparator}
            highlightTaskComparator={highlightTaskComparator}
            onToggle={onToggle}
            toggleExpanded={toggleExpanded}
            isExpanded={expanded.has(child.id)}
            expanded={expanded}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
          />
        ))}
      </Collapse>
    </>
  );
};

export default React.memo(GanttTaskBarView) as typeof GanttTaskBarView;
