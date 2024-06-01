import { GanttTask, RequestEventChange, transformWorkPackageToGanttTask } from '../../../../utils/gantt.utils';
import { WbsNumber, wbsPipe } from 'shared';
import { useSingleWorkPackage } from '../../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import { projectWbsPipe } from '../../../../utils/pipes';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';

const BlockedGanttTaskView = ({
  days,
  teamName,
  getStartCol,
  getEndCol,
  wbsNumber,
  handleOnMouseOver,
  handleOnMouseLeave,
  onWorkPackageToggle,
  highlightedChange,
  getNewWorkPackageNumber
}: {
  days: Date[];
  wbsNumber: WbsNumber;
  teamName: string;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  handleOnMouseOver: (e: React.MouseEvent, task: GanttTask) => void;
  handleOnMouseLeave: () => void;
  onWorkPackageToggle?: () => void;
  highlightedChange?: RequestEventChange;
  getNewWorkPackageNumber: (projectId: string) => number;
}) => {
  const { isLoading, data, isError, error } = useSingleWorkPackage(wbsNumber);

  if (isError) return <ErrorPage error={error} />;
  if (isLoading || !data) return <LoadingIndicator />;

  const task = transformWorkPackageToGanttTask(data, teamName, []);

  return (
    <>
      <GanttTaskBarDisplay
        days={days}
        task={task}
        isProject={false}
        handleOnMouseOver={handleOnMouseOver}
        handleOnMouseLeave={handleOnMouseLeave}
        onWorkPackageToggle={onWorkPackageToggle}
        showWorkPackages={false}
        highlightedChange={highlightedChange}
        getStartCol={getStartCol}
        getEndCol={getEndCol}
      />
      {task.blocking.map((wbsNum) => {
        return (
          <BlockedGanttTaskView
            key={wbsPipe(wbsNum)}
            days={days}
            wbsNumber={wbsNum}
            teamName={teamName}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            handleOnMouseOver={handleOnMouseOver}
            handleOnMouseLeave={handleOnMouseLeave}
            highlightedChange={
              highlightedChange && projectWbsPipe(highlightedChange.element.wbsNum) === projectWbsPipe(data.wbsNum)
                ? highlightedChange
                : undefined
            }
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        );
      })}
    </>
  );
};

export default BlockedGanttTaskView;
