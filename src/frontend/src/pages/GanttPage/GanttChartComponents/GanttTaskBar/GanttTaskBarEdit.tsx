import { transformWorkPackageToGanttTask, GanttTask, GanttChange } from '../../../../utils/gantt.utils';
import { wbsPipe, WorkPackage } from 'shared';
import { GanttTaskBarEditView } from './GanttTaskBarEditView';

const GanttTaskBarEdit = ({
  days,
  task,
  createChange,
  getStartCol,
  getEndCol,
  isProject,
  addWorkPackage,
  getNewWorkPackageNumber
}: {
  days: Date[];
  task: GanttTask;
  createChange: (change: GanttChange) => void;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  isProject: boolean;
  addWorkPackage: (workPackage: WorkPackage) => void;
  getNewWorkPackageNumber: (projectId: string) => number;
}) => {
  return (
    <>
      <GanttTaskBarEditView
        days={days}
        task={task}
        isProject={isProject}
        createChange={createChange}
        getNewWorkPackageNumber={getNewWorkPackageNumber}
        addWorkPackage={addWorkPackage}
        getStartCol={getStartCol}
        getEndCol={getEndCol}
      />
      {task.unblockedWorkPackages.map((workPackage) => {
        return (
          <GanttTaskBarEdit
            key={workPackage.id}
            days={days}
            task={transformWorkPackageToGanttTask(workPackage, task.teamName, task.allWorkPackages)}
            createChange={createChange}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            isProject={false}
            addWorkPackage={addWorkPackage}
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        );
      })}
      {task.blocking.map((wbsNum) => {
        const workPackage = task.allWorkPackages.find((wp) => wbsPipe(wp.wbsNum) === wbsPipe(wbsNum));
        if (!workPackage) return <></>;

        return (
          <GanttTaskBarEdit
            key={wbsPipe(wbsNum)}
            days={days}
            isProject={false}
            task={transformWorkPackageToGanttTask(workPackage, task.teamName, task.allWorkPackages)}
            createChange={createChange}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            addWorkPackage={addWorkPackage}
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        );
      })}
    </>
  );
};

export default GanttTaskBarEdit;
