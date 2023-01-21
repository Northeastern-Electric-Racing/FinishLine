/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Gantt } from './GanttPackage/components/gantt/gantt';
import { Task, ViewMode } from './GanttPackage/types/public-types';
import { FC, useEffect, useState } from 'react';

interface GanttPageProps {
  ganttDisplayObjects: Task[];
}

const GanttPage: FC<GanttPageProps> = ({ ganttDisplayObjects }) => {
  const [ganttDisplayObjectList, setGanttDisplayObjectList] = useState<Task[]>(ganttDisplayObjects);

  useEffect(() => {
    setGanttDisplayObjectList(ganttDisplayObjects);
  }, [ganttDisplayObjects]);

  const handleExpanderClick = (task: Task) => {
    setGanttDisplayObjectList(ganttDisplayObjectList.map((t) => (t.id === task.id ? task : t)));
  };

  return ganttDisplayObjectList.length > 0 ? (
    <Gantt
      tasks={ganttDisplayObjectList}
      viewMode={ViewMode.Week}
      preStepsCount={1}
      locale={'US'}
      onExpanderClick={handleExpanderClick}
      columnWidth={67}
      onClick={(task) => {
        if (task.onClick) task.onClick();
      }}
    />
  ) : (
    <b>No Tasks To Display</b>
  );
};

export default GanttPage;
