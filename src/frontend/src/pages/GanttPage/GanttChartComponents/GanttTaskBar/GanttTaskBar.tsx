/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { GanttChange, GanttTask, RequestEventChange } from '../../../../utils/gantt.utils';
import { dateToString, getMonday } from '../../../../utils/datetime.utils';
import GanttTaskBarEdit from './GanttTaskBarEdit';
import GanttTaskBarView from './GanttTaskBarView';
import { WorkPackage } from 'shared';
import { ArcherContainer, ArcherContainerRef } from 'react-archer';
import { useRef } from 'react';
import { ArcherContainerHandle } from 'react-archer/lib/ArcherContainer/ArcherContainer.types';

const GanttTaskBar = ({
  days,
  task,
  createChange,
  isEditMode,
  handleOnMouseOver,
  onWorkPackageToggle,
  handleOnMouseLeave,
  showWorkPackages = false,
  highlightedChange,
  addWorkPackage = () => {},
  getNewWorkPackageNumber
}: {
  days: Date[];
  task: GanttTask;
  createChange: (change: GanttChange) => void;
  isEditMode: boolean;
  handleOnMouseOver: (e: React.MouseEvent, task: GanttTask) => void;
  handleOnMouseLeave: () => void;
  onWorkPackageToggle?: () => void;
  showWorkPackages?: boolean;
  highlightedChange?: RequestEventChange;
  addWorkPackage?: (task: WorkPackage) => void;
  getNewWorkPackageNumber: (projectId: string) => number;
}) => {
  const isProject = !task.projectId;
  const archerRef = useRef<ArcherContainerHandle>(null);

  const getStartCol = (start: Date) => {
    const startCol = days.findIndex((day) => dateToString(day) === dateToString(getMonday(start))) + 1;
    return startCol;
  };

  // if the end date doesn't exist within the timeframe, have it span to the end
  const getEndCol = (end: Date) => {
    const endCol =
      days.findIndex((day) => dateToString(day) === dateToString(getMonday(end))) === -1
        ? days.length + 1
        : days.findIndex((day) => dateToString(day) === dateToString(getMonday(end))) + 2;
    return endCol;
  };

  const handleChange = (change: GanttChange) => {
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
            isProject={isProject}
            addWorkPackage={addWorkPackage}
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        ) : (
          <GanttTaskBarView
            days={days}
            task={task}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            isProject={isProject}
            handleOnMouseOver={handleOnMouseOver}
            handleOnMouseLeave={handleOnMouseLeave}
            onWorkPackageToggle={onWorkPackageToggle}
            showWorkPackages={showWorkPackages}
            highlightedChange={highlightedChange}
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        )}
      </div>
    </ArcherContainer>
  );
};

export default GanttTaskBar;
