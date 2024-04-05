/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import { Task } from './GanttPackage/types/public-types';
import { Gantt } from './GanttPackage/components/gantt/GanttChart';

interface GanttPageProps {
  ganttTasks: Task[];
  start: Date;
  end: Date;
  onExpanderClick: (ganttTasks: Task) => void;
  isEditMode: boolean;
}

const GanttChart: React.FC<GanttPageProps> = ({ ganttTasks, start, end, onExpanderClick, isEditMode }) => {
  return ganttTasks.length > 0 ? (
    <Gantt start={start} end={end} tasks={ganttTasks} isEditMode={isEditMode} />
  ) : (
    <Typography sx={{ mx: 1 }}>No items to display</Typography>
  );
};

export default GanttChart;
