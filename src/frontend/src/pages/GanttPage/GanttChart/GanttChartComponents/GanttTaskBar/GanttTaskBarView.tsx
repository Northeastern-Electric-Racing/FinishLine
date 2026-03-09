import {
  RequestEventChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions
} from '../../../../../utils/gantt.utils';
import { Box } from '@mui/material';
import GanttTaskBar from './GanttTaskBar';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';
import React, { startTransition, useState } from 'react';

interface GanttTaskBarViewProps<T> {
  days: Date[];
  task: GanttTask<T>;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
  handleOnMouseLeave: () => void;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
  highlightedChange?: RequestEventChange<T>;
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
  highlightedChange,
  onAddTaskPressed,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttTaskBarViewProps<T>) => {
  const [showChildren, setShowChildren] = useState(false);

  // Starts empty — populated once on first dropdown click via loadChildren()
  const [loadedChildren, setLoadedChildren] = useState<GanttTask<T>[]>(task.children);
  const [hasLoaded, setHasLoaded] = useState(task.children.length > 0);

  const handleToggle = () => {
    if (!hasLoaded && task.loadChildren) {
      // Run transformation once and cache result — never runs again
      setLoadedChildren(task.loadChildren());
      setHasLoaded(true);
    }
    // startTransition keeps UI responsive while React mounts children
    startTransition(() => {
      setShowChildren((prev) => !prev);
    });
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
      <Box sx={{ display: showChildren ? 'block' : 'none' }}>
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
          />
        ))}
      </Box>
    </>
  );
};

export default React.memo(GanttTaskBarView) as typeof GanttTaskBarView;
