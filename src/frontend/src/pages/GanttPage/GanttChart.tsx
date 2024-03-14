/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import { calculateEndDate } from 'shared';
import { Gantt } from './GanttPackage/components/gantt/gantt';
import { Task, ViewMode } from './GanttPackage/types/public-types';
import { GanttChart as NewGanttChart } from '../../components/GanttChart/GanttChart';

interface GanttPageProps {
  ganttTasks: Task[];
  onExpanderClick: (ganttTasks: Task) => void;
}

const GanttChart: React.FC<GanttPageProps> = ({ ganttTasks, onExpanderClick }) => {
  const data = [
    { id: '1', start: new Date('2024-01-04'), end: new Date('2024-01-15'), title: 'First event' },
    { id: '2', start: new Date('2024-01-12'), end: new Date('2024-01-31'), title: 'Second event' }
  ];
  return ganttTasks.length > 0 ? (
    <>
      <NewGanttChart start={new Date('2023-12-25')} end={new Date('2024-12-5')} data={data} />

      <div style={{ marginBottom: 100, backgroundColor: 'red' }} />
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
    </>
  ) : (
    <Typography sx={{ mx: 1 }}>No items to display</Typography>
  );
};

export default GanttChart;
