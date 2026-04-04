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
import { dateToString, getMonday } from '../../../../../utils/datetime.utils';

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
  const archerRef = useRef<ArcherContainerHandle>(null);

  const getStartCol = useCallback(
    (start: Date) => {
      const startCol = days.findIndex((day) => day.toDateString() === getMonday(start).toDateString()) + 1;
      return startCol;
    },
    [days]
  );

  // if the end date doesn't exist within the timeframe, have it span to the end
  const getEndCol = useCallback(
    (end: Date) => {
      const endCol =
        days.findIndex((day) => day.toDateString() === getMonday(end).toDateString()) === -1
          ? days.length + 1
          : days.findIndex((day) => day.toDateString() === getMonday(end).toDateString()) + 2;
      return endCol;
    },
    [days]
  );

  const handleChange = (change: GanttChange<T>) => {
    createChange(change);
    setTimeout(() => {
      if (archerRef.current) {
        archerRef.current.refreshScreen();
      }
    }, 100); // wait for the change to be added to the state and the DOM to update
  };

  return (
    <ArcherContainer ref={archerRef} strokeColor="#ef4545">
      <div id={`gantt-task-${task.id}`}>
        {isEditMode ? (
          <GanttTaskBarEdit
            days={days}
            task={task}
            createChange={handleChange}
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
    </ArcherContainer>
  );
};

export default GanttTaskBar;
