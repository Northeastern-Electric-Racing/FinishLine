/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { EventChange, GanttTaskData, RequestEventChange } from '../../../../utils/gantt.utils';
import { dateToString, getMonday } from '../../../../utils/datetime.utils';
import GanttTaskBarEdit from './GanttTaskBarEdit';
import GanttTaskBarView from './GanttTaskBarView';

const GanttTaskBar = ({
  days,
  event,
  createChange,
  isEditMode,
  handleOnMouseOver,
  onWorkPackageToggle,
  handleOnMouseLeave,
  showWorkPackages = false,
  highlightedChange,
  addWorkPackage = () => {}
}: {
  days: Date[];
  event: GanttTaskData;
  createChange: (change: EventChange) => void;
  isEditMode: boolean;
  handleOnMouseOver: (e: React.MouseEvent, event: GanttTaskData) => void;
  handleOnMouseLeave: () => void;
  onWorkPackageToggle?: () => void;
  showWorkPackages?: boolean;
  highlightedChange?: RequestEventChange;
  addWorkPackage?: (task: GanttTaskData) => void;
}) => {
  const isProject = !event.projectId;

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

  const onMouseOver = (e: React.MouseEvent) => {
    handleOnMouseOver(e, event);
  };

  return (
    <div id={`gantt-task-${event.id}`}>
      {isEditMode ? (
        <GanttTaskBarEdit
          days={days}
          event={event}
          createChange={createChange}
          getStartCol={getStartCol}
          getEndCol={getEndCol}
          isProject={isProject}
          addWorkPackage={addWorkPackage}
        />
      ) : (
        <GanttTaskBarView
          days={days}
          event={event}
          getStartCol={getStartCol}
          getEndCol={getEndCol}
          isProject={isProject}
          handleOnMouseOver={onMouseOver}
          handleOnMouseLeave={handleOnMouseLeave}
          onWorkPackageToggle={onWorkPackageToggle}
          showWorkPackages={showWorkPackages}
          highlightedChange={highlightedChange}
        />
      )}{' '}
    </div>
  );
};

export default GanttTaskBar;
