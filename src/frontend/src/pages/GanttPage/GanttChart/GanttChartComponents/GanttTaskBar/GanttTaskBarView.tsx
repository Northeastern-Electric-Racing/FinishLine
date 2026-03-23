import {
  RequestEventChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions
} from '../../../../../utils/gantt.utils';
import { Collapse } from '@mui/material';
import GanttTaskBar from './GanttTaskBar';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';
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
  const [loadedChildren, setLoadedChildren] = useState<GanttTask<T>[]>(task.children);
  const [hasLoaded, setHasLoaded] = useState(task.children.length > 0);

  const handleToggle = () => {
    if (!hasLoaded && task.loadChildren) {
      setLoadedChildren(task.loadChildren());
      setHasLoaded(true);
    }
    setShowChildren((prev) => !prev);
  };

  console.log('I Rerender!');

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
        {loadedChildren.map((child) => (
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
    </>
  );
};

export default GanttTaskBarView;
