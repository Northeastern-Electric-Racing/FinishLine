/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackage } from 'shared';
import { Box } from '@mui/material';
import GanttChart from '../../GanttPage/GanttChart/GanttChart';
import { GanttCollection, getGanttDateBounds, transformWorkPackageToGanttTask } from '../../../utils/gantt.utils';

interface ProjectGanttProps {
  workPackages: WorkPackage[];
}

const ProjectGantt: React.FC<ProjectGanttProps> = ({ workPackages }) => {
  if (workPackages.length === 0) return <Box sx={{ my: 2 }} />;

  const { start: startDate, end: endDate } = getGanttDateBounds(workPackages);

  const collection: GanttCollection<string, WorkPackage> = {
    id: 'project-gantt',
    element: 'Work Packages',
    title: 'Work Packages',
    tasks: workPackages.map((wp) => transformWorkPackageToGanttTask(wp, workPackages))
  };

  return (
    <Box sx={{ my: 2 }}>
      <GanttChart collections={[collection]} startDate={startDate} endDate={endDate} />
    </Box>
  );
};

export default ProjectGantt;
