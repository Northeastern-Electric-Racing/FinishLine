/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import { calculateEndDate } from 'shared';
import { Gantt } from './GanttPackage/components/gantt/gantt';
import { Task, ViewMode } from './GanttPackage/types/public-types';

interface GanttPageProps {
  ganttTasks: Task[];
  onExpanderClick: (ganttTasks: Task) => void;
}

const GanttChart: React.FC<GanttPageProps> = ({ ganttTasks, onExpanderClick }) => {
  return ganttTasks.length > 0 ? (
    <Gantt
      tasks={ganttTasks}
      viewMode={ViewMode.Week}
      viewDate={calculateEndDate(new Date(), -3)}
      preStepsCount={1}
      locale={'US'}
      onExpanderClick={onExpanderClick}
      columnWidth={35}
      onClick={(task) => {
        if (task.onClick) task.onClick();
      }}
    />
  ) : (
    <Typography sx={{ mx: 1 }}>No items to display</Typography>
  );
};

export default GanttChart;
