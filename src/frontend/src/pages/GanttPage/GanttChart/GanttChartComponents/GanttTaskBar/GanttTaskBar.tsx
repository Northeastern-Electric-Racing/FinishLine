import GanttTaskBarEdit from './GanttTaskBarEdit';
import GanttTaskBarView from './GanttTaskBarView';
import {
  GanttChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions,
  RequestEventChange
} from '../../../../../utils/gantt.utils';
import { dateToString, getMonday } from '../../../../../utils/datetime.utils';
import { memo, useCallback } from 'react';

interface GanttTaskBarProps<T> {
  days: Date[];
  task: GanttTask<T>;
  createChange: (change: GanttChange<T>) => void;
  isEditMode: boolean;
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
  handleOnMouseLeave: () => void;
  highlightedChange?: RequestEventChange<T>;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const GanttTaskBar = <T,>({
  days,
  task,
  createChange,
  isEditMode,
  handleOnMouseOver,
  handleOnMouseLeave,
  highlightedChange,
  onAddTaskPressed,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttTaskBarProps<T>) => {
  const getStartCol = useCallback(
    (start: Date) => {
      return days.findIndex((day) => dateToString(day) === dateToString(getMonday(start))) + 1;
    },
    [days]
  );

  const getEndCol = useCallback(
    (end: Date) => {
      const idx = days.findIndex((day) => dateToString(day) === dateToString(getMonday(end)));
      return idx === -1 ? days.length + 1 : idx + 2;
    },
    [days]
  );

  return (
    <div id={`gantt-task-${task.id}`}>
      {isEditMode ? (
        <GanttTaskBarEdit
          days={days}
          task={task}
          createChange={createChange}
          getStartCol={getStartCol}
          getEndCol={getEndCol}
          onAddTaskPressed={onAddTaskPressed}
        />
      ) : (
        <GanttTaskBarView
          days={days}
          task={task}
          getStartCol={getStartCol}
          getEndCol={getEndCol}
          handleOnMouseOver={handleOnMouseOver}
          handleOnMouseLeave={handleOnMouseLeave}
          highlightedChange={highlightedChange}
          onAddTaskPressed={onAddTaskPressed}
          highlightSubtaskComparator={highlightSubtaskComparator}
          highlightTaskComparator={highlightTaskComparator}
        />
      )}
    </div>
  );
};

export default memo(GanttTaskBar) as typeof GanttTaskBar;
