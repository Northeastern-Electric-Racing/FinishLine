/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import GanttTaskBarEdit from './GanttTaskBarEdit';
import GanttTaskBarView from './GanttTaskBarView';
import { ArcherContainer } from 'react-archer';
import { useCallback } from 'react';
import { useRef } from 'react';
import { ArcherContainerHandle } from 'react-archer/lib/ArcherContainer/ArcherContainer.types';
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
  highlightedChange?: RequestEventChange<T>;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
  onToggle?: () => void;
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
  onToggle
}: GanttTaskBarProps<T>) => {
  const archerRef = useRef<ArcherContainerHandle>(null);

  const getStartCol = useCallback(
    (start: Date) => {
      const startCol = days.findIndex((day) => dateToString(day) === dateToString(getMonday(start))) + 1;
      return startCol;
    },
    [days]
  );

  // if the end date doesn't exist within the timeframe, have it span to the end
  const getEndCol = useCallback(
    (end: Date) => {
      const endCol =
        days.findIndex((day) => dateToString(day) === dateToString(getMonday(end))) === -1
          ? days.length + 1
          : days.findIndex((day) => dateToString(day) === dateToString(getMonday(end))) + 2;
      return endCol;
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
          onToggle={onToggle}
        />
      )}
    </div>
  );
};

export default GanttTaskBar;
