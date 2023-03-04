/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import { calculateEndDate } from 'shared';
import { Gantt } from './GanttPackage/components/gantt/gantt';
import { Task, ViewMode } from './GanttPackage/types/public-types';

interface GanttPageProps {
  ganttDisplayObjects: Task[];
  setGanttDisplayObjects: (ganttDisplayObjects: Task[]) => void;
}

const GanttChart: React.FC<GanttPageProps> = ({ ganttDisplayObjects, setGanttDisplayObjects }) => {
  // This is separate from the expand/collapse button
  const handleExpanderClick = (task: Task) => {
    setGanttDisplayObjects(ganttDisplayObjects.map((t) => (t.id === task.id ? task : t)));
  };

  return ganttDisplayObjects.length > 0 ? (
    <Gantt
      tasks={ganttDisplayObjects}
      viewMode={ViewMode.Week}
      viewDate={calculateEndDate(new Date(), -5)}
      preStepsCount={1}
      locale={'US'}
      onExpanderClick={handleExpanderClick}
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
