import {
  RequestEventChange,
  transformWorkPackageToGanttTask,
  GanttTask,
  isHighlightedChangeOnWbsProject
} from '../../../../utils/gantt.utils';
import { Collapse } from '@mui/material';

import GanttTaskBar from './GanttTaskBar';
import BlockedGanttTaskView from './BlockedTaskBarView';
import { wbsPipe } from 'shared';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';

const GanttTaskBarView = ({
  days,
  task,
  getStartCol,
  getEndCol,
  isProject,
  handleOnMouseOver,
  handleOnMouseLeave,
  onWorkPackageToggle,
  showWorkPackages,
  highlightedChange,
  getNewWorkPackageNumber
}: {
  days: Date[];
  task: GanttTask;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  isProject: boolean;
  handleOnMouseOver: (e: React.MouseEvent, task: GanttTask) => void;
  handleOnMouseLeave: () => void;
  onWorkPackageToggle?: () => void;
  showWorkPackages?: boolean;
  highlightedChange?: RequestEventChange;
  getNewWorkPackageNumber: (projectId: string) => number;
}) => {
  return (
    <>
      <GanttTaskBarDisplay
        days={days}
        task={task}
        isProject={isProject}
        handleOnMouseOver={handleOnMouseOver}
        handleOnMouseLeave={handleOnMouseLeave}
        onWorkPackageToggle={onWorkPackageToggle}
        showWorkPackages={showWorkPackages}
        highlightedChange={highlightedChange}
        getStartCol={getStartCol}
        getEndCol={getEndCol}
      />

      <Collapse in={showWorkPackages}>
        {task.unblockedWorkPackages.map((workPackage) => {
          return (
            <GanttTaskBar
              key={workPackage.id}
              days={days}
              task={transformWorkPackageToGanttTask(workPackage, task.teamName, task.allWorkPackages)}
              isEditMode={false}
              createChange={() => {}}
              handleOnMouseOver={handleOnMouseOver}
              handleOnMouseLeave={handleOnMouseLeave}
              highlightedChange={highlightedChange}
              getNewWorkPackageNumber={getNewWorkPackageNumber}
            />
          );
        })}
      </Collapse>
      {task.blocking.map((wbsNum) => {
        return (
          <BlockedGanttTaskView
            key={wbsPipe(wbsNum)}
            days={days}
            wbsNumber={wbsNum}
            teamName={task.teamName}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            handleOnMouseOver={handleOnMouseOver}
            handleOnMouseLeave={handleOnMouseLeave}
            highlightedChange={
              highlightedChange && isHighlightedChangeOnWbsProject(highlightedChange, wbsNum) ? highlightedChange : undefined
            }
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        );
      })}
    </>
  );
};

export default GanttTaskBarView;
