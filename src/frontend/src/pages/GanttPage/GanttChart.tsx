/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import { Gantt } from './Gantt';
import { EventChange, Task } from '../../utils/gantt.utils';

interface GanttPageProps {
  ganttTasks: Task[];
  start: Date;
  end: Date;
  onExpanderClick: (ganttTasks: Task) => void;
  isEditMode: boolean;
  saveChanges: (eventChanges: EventChange[]) => void;
}

const GanttChart: React.FC<GanttPageProps> = ({ ganttTasks, start, end, onExpanderClick, isEditMode, saveChanges }) => {
  return ganttTasks.length > 0 ? (
    <Gantt start={start} end={end} tasks={ganttTasks} isEditMode={isEditMode} saveChanges={saveChanges} />
  ) : (
    <Typography sx={{ mx: 1 }}>No items to display</Typography>
  );
};

export default GanttChart;
