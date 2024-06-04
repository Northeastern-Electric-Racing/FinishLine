/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { GanttChange, GanttTask, RequestEventChange } from '../../../../utils/gantt.utils';
import { dateToString, getMonday } from '../../../../utils/datetime.utils';
import GanttTaskBarEdit from './GanttTaskBarEdit';
import GanttTaskBarView from './GanttTaskBarView';
import { WorkPackage } from 'shared';

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

  return (
    <div id={`gantt-task-${task.id}`}>
      {isEditMode ? (
        <GanttTaskBarEdit
          days={days}
          task={task}
          createChange={createChange}
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
  );
};

export default GanttTaskBar;
