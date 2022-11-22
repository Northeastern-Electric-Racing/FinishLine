/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Gantt } from './temp/components/gantt/gantt';
import { Task, ViewMode } from './temp/types/public-types';
import TaskListHeader from './TaskListHeader';
import TaskListTable from './TaskListTable';
import { useState } from 'react';
import TooltipContent from './TooltipContent';

interface GanttPageProps {
  tasks: Task[];
}

const GanttPage: React.FC<GanttPageProps> = ({ tasks }) => {
  const [taskList, setTaskList] = useState<Task[]>(tasks);

  const handleExpanderClick = (task: Task) => {
    setTaskList(taskList.map((t) => (t.id === task.id ? task : t)));
  };

  return (
    <Gantt
      tasks={taskList}
      viewMode={ViewMode.Week}
      preStepsCount={1}
      locale={'US'}
      onExpanderClick={handleExpanderClick}
      TaskListHeader={TaskListHeader}
      TaskListTable={TaskListTable}
      columnWidth={67}
      TooltipContent={TooltipContent}
      onClick={(task) => {
        if (task.onClick) task.onClick();
      }}
    />
  );
};

export default GanttPage;
