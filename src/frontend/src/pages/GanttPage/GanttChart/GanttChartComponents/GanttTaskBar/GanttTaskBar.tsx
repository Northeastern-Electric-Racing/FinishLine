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
  onToggle?: () => void;
  toggleExpanded: (id: string) => void;
  isExpanded: boolean;
  expanded: Set<string>;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
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
  highlightTaskComparator,
  onToggle,
  toggleExpanded,
  isExpanded,
  expanded,
  getStartCol,
  getEndCol
}: GanttTaskBarProps<T>) => {
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
          onToggle={onToggle}
          toggleExpanded={toggleExpanded}
          isExpanded={isExpanded}
          expanded={expanded}
        />
      )}
    </div>
  );
};

export default GanttTaskBar;
