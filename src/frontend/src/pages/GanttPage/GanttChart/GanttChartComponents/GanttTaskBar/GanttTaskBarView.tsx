import {
  RequestEventChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions
} from '../../../../../utils/gantt.utils';
import { Collapse } from '@mui/material';
import GanttTaskBar from './GanttTaskBar';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';
import BlockedGanttTaskView from './BlockedTaskBarView';
import { useState } from 'react';

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
  onToggle
}: GanttTaskBarViewProps<T>) => {
  const [showChildren, setShowChildren] = useState(false);

  const handleToggle = () => {
    setShowChildren((prev) => !prev);
  };

  return (
    <>
      <GanttTaskBarDisplay
        days={days}
        task={task}
        handleOnMouseOver={handleOnMouseOver}
        handleOnMouseLeave={handleOnMouseLeave}
        showChildren={showChildren}
        onShowChildrenToggle={handleToggle}
        highlightedChange={highlightedChange}
        getStartCol={getStartCol}
        getEndCol={getEndCol}
        highlightSubtaskComparator={highlightSubtaskComparator}
        highlightTaskComparator={highlightTaskComparator}
      />

      <Collapse in={showChildren} unmountOnExit onEntered={onToggle} onExited={onToggle}>
        {task.children.map((child) => (
          <GanttTaskBar
            key={child.id}
            days={days}
            task={child}
            isEditMode={false}
            createChange={() => {}}
            handleOnMouseOver={handleOnMouseOver}
            handleOnMouseLeave={handleOnMouseLeave}
            highlightedChange={highlightedChange}
            onAddTaskPressed={onAddTaskPressed}
            highlightSubtaskComparator={highlightSubtaskComparator}
            highlightTaskComparator={highlightTaskComparator}
            onToggle={onToggle}
          />
        ))}
      </Collapse>
      {task.blocking.map((blocking) => {
        return (
          <BlockedGanttTaskView
            key={blocking.id}
            parentTask={task}
            task={blocking}
            days={days}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            handleOnMouseOver={handleOnMouseOver}
            onShowChildrenToggle={handleToggle}
            highlightSubtaskComparator={highlightSubtaskComparator}
            highlightTaskComparator={highlightTaskComparator}
            handleOnMouseLeave={handleOnMouseLeave}
            highlightedChange={highlightedChange}
          />
        );
      })}
    </>
  );
};

export default GanttTaskBarView;
