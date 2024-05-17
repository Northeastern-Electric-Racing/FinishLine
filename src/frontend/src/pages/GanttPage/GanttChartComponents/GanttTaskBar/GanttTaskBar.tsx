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
  highlightedChange
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
}) => {
  const isProject = !event.project;

  const getStartCol = (event: GanttTaskData) => {
    const startCol = days.findIndex((day) => dateToString(day) === dateToString(getMonday(event.start))) + 1;
    return startCol;
  };

  // if the end date doesn't exist within the timeframe, have it span to the end
  const getEndCol = (event: GanttTaskData) => {
    const endCol =
      days.findIndex((day) => dateToString(day) === dateToString(getMonday(event.end))) === -1
        ? days.length + 1
        : days.findIndex((day) => dateToString(day) === dateToString(getMonday(event.end))) + 2;
    return endCol;
  };

  const onMouseOver = (e: React.MouseEvent) => {
    handleOnMouseOver(e, event);
  };

  return isEditMode ? (
    <GanttTaskBarEdit
      days={days}
      event={event}
      createChange={createChange}
      getStartCol={getStartCol}
      getEndCol={getEndCol}
      isProject={isProject}
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
  );
};

export default GanttTaskBar;
