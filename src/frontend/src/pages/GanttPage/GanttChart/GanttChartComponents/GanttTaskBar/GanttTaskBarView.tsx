import {
  RequestEventChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions
} from '../../../../../utils/gantt.utils';
import { Box } from '@mui/material';
import GanttTaskBar from './GanttTaskBar';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';
import { useEffect, useRef, useState } from 'react';

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
  const animationRef = useRef<number | null>(null);

  const handleToggle = () => {
    setShowChildren((prev) => !prev);
  };

  // Fire onToggle after the grid animation completes (200ms matches transition below)
  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    const timeout = setTimeout(() => onToggle?.(), 200);
    return () => clearTimeout(timeout);
  }, [showChildren, onToggle]);

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
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: showChildren ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms ease',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ minHeight: 0 }}>
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
        </Box>
      </Box>
    </>
  );
};

export default GanttTaskBarView;
