import { WbsNumber } from 'shared';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useSingleProject } from '../../../../hooks/projects.hooks';
import { RequestEventChange, transformProjectToGanttTask } from '../../../../utils/gantt.utils';
import ErrorPage from '../../../ErrorPage';
import GanttTaskBarView from './GanttTaskBarView';

const GanttTaskBarProjectView = ({
  days,
  wbsNum,
  getStartCol,
  getEndCol,
  handleOnMouseOver,
  handleOnMouseLeave,
  onWorkPackageToggle,
  showWorkPackages,
  highlightedChange,
  getNewWorkPackageNumber,
  teamName
}: {
  days: Date[];
  wbsNum: WbsNumber;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  handleOnMouseOver: (e: React.MouseEvent) => void;
  handleOnMouseLeave: () => void;
  onWorkPackageToggle?: () => void;
  showWorkPackages?: boolean;
  highlightedChange?: RequestEventChange;
  getNewWorkPackageNumber: (projectId: string) => number;
  teamName: string;
}) => {
  const { isLoading, isError, error, data } = useSingleProject(wbsNum);

  if (isLoading || !data) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} />;

  return (
    <GanttTaskBarView
      days={days}
      task={transformProjectToGanttTask(data, teamName)}
      getStartCol={getStartCol}
      getEndCol={getEndCol}
      isProject
      handleOnMouseOver={handleOnMouseOver}
      handleOnMouseLeave={handleOnMouseLeave}
      onWorkPackageToggle={onWorkPackageToggle}
      showWorkPackages={showWorkPackages}
      highlightedChange={highlightedChange}
      getNewWorkPackageNumber={getNewWorkPackageNumber}
    />
  );
};

export default GanttTaskBarProjectView;
