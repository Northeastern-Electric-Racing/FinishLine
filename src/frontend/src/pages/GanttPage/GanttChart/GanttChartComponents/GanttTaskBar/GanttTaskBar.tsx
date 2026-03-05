/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import GanttTaskBarEdit from './GanttTaskBarEdit';
import GanttTaskBarView from './GanttTaskBarView';
import {
  GanttChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions,
  RequestEventChange
} from '../../../../../utils/gantt.utils';
import { getMonday } from '../../../../../utils/datetime.utils';
import { toDateString } from 'shared';

interface GanttTaskBarProps<T> {
  days: Date[];
  task: GanttTask<T>;
  createChange: (change: GanttChange<T>) => void;
  isEditMode: boolean;
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
  handleOnMouseLeave: () => void;
  onShowChildrenToggle: () => void;
  showChildren?: boolean;
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
  onShowChildrenToggle,
  handleOnMouseLeave,
  showChildren = false,
  highlightedChange,
  onAddTaskPressed,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttTaskBarProps<T>) => {
  const getStartCol = (start: Date) => {
    const startCol = days.findIndex((day) => toDateString(day) === toDateString(getMonday(start))) + 1;
    return startCol;
  };

  const getEndCol = (end: Date) => {
    const endCol =
      days.findIndex((day) => toDateString(day) === toDateString(getMonday(end))) === -1
        ? days.length + 1
        : days.findIndex((day) => toDateString(day) === toDateString(getMonday(end))) + 2;
    return endCol;
  };

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
          showChildren={showChildren}
          onShowChildrenToggle={onShowChildrenToggle}
          highlightedChange={highlightedChange}
          onAddTaskPressed={onAddTaskPressed}
          highlightSubtaskComparator={highlightSubtaskComparator}
          highlightTaskComparator={highlightTaskComparator}
        />
      )}
    </div>
  );
};

export default GanttTaskBar;
