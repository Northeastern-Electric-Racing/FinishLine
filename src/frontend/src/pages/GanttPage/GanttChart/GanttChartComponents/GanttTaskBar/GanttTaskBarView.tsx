import {
  RequestEventChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions
} from '../../../../../utils/gantt.utils';
import { Collapse } from '@mui/material';
import GanttTaskBar from './GanttTaskBar';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';
import { useEffect, useState } from 'react';

interface GanttTaskBarViewProps<T> {
  days: Date[];
  task: GanttTask<T>;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
  handleOnMouseLeave: () => void;
  onShowChildrenToggle: () => void;
  showChildren: boolean;
  highlightedChange?: RequestEventChange<T>;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const GanttTaskBarView = <T,>({
  days,
  task,
  getStartCol,
  getEndCol,
  handleOnMouseOver,
  handleOnMouseLeave,
  onShowChildrenToggle,
  showChildren,
  highlightedChange,
  onAddTaskPressed,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttTaskBarViewProps<T>) => {
  const [loadedChildren, setLoadedChildren] = useState<GanttTask<T>[]>(task.children);
  const [hasLoaded, setHasLoaded] = useState(task.children.length > 0);

  useEffect(() => {
    if (showChildren && !hasLoaded && task.loadChildren) {
      setLoadedChildren(task.loadChildren());
      setHasLoaded(true);
    }
  }, [showChildren, hasLoaded, task]);

  console.log('I Rerender!');

  return (
    <>
      <GanttTaskBarDisplay
        days={days}
        task={task}
        handleOnMouseOver={handleOnMouseOver}
        handleOnMouseLeave={handleOnMouseLeave}
        showChildren={showChildren}
        onShowChildrenToggle={onShowChildrenToggle}
        highlightedChange={highlightedChange}
        getStartCol={getStartCol}
        getEndCol={getEndCol}
        highlightSubtaskComparator={highlightSubtaskComparator}
        highlightTaskComparator={highlightTaskComparator}
      />

      <Collapse in={showChildren} unmountOnExit>
        {loadedChildren.map((child) => {
          return (
            <GanttTaskBar
              key={child.id}
              days={days}
              task={child}
              isEditMode={false}
              createChange={() => {}}
              handleOnMouseOver={handleOnMouseOver}
              handleOnMouseLeave={handleOnMouseLeave}
              onShowChildrenToggle={onShowChildrenToggle}
              highlightedChange={highlightedChange}
              onAddTaskPressed={onAddTaskPressed}
              highlightSubtaskComparator={highlightSubtaskComparator}
              highlightTaskComparator={highlightTaskComparator}
            />
          );
        })}
      </Collapse>
    </>
  );
};

export default GanttTaskBarView;
