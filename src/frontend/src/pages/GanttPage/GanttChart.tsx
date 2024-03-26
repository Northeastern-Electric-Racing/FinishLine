/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import { Task, ViewMode } from './GanttPackage/types/public-types';
import { GanttChart as Gantt } from './GanttPackage/components/gantt/GanttChart';

interface GanttPageProps {
  ganttTasks: Task[];
  onExpanderClick: (ganttTasks: Task) => void;
}

const GanttChart: React.FC<GanttPageProps> = ({ ganttTasks, onExpanderClick }) => {
  return ganttTasks.length > 0 ? (
    <>
      <Gantt start={new Date('2023-01-16')} end={new Date('2024-12-2')} tasks={ganttTasks} />

      <div style={{ marginBottom: 100, backgroundColor: 'red' }} />
    </>
  ) : (
    <Typography sx={{ mx: 1 }}>No items to display</Typography>
  );
};

export default GanttChart;
