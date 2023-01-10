/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Gantt } from './GanttPackage/components/gantt/gantt';
import { Task, ViewMode } from './GanttPackage/types/public-types';
import { useState } from 'react';

interface GanttPageProps {
  tasks: Task[];
}

const GanttPage: React.FC<GanttPageProps> = ({ tasks }) => {
  const [taskList, setTaskList] = useState<Task[]>(tasks);

  const handleExpanderClick = (task: Task) => {
    setTaskList(taskList.map((t) => (t.id === task.id ? task : t)));
  };

  return taskList.length > 0 ? (
    <Gantt
      tasks={taskList}
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
