/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Gantt, Task, ViewMode } from 'gantt-task-react';
import TaskListHeader from './TaskListHeader';
import TaskListTable from './TaskListTable';
import { useState } from 'react';

interface GanttPageProps {
  tasks: Task[];
}

const GanttPage: React.FC<GanttPageProps> = ({ tasks }) => {
  const [taskList, setTaskList] = useState<Task[]>(tasks);

  const handleExpanderClick = (task: Task) => {
    setTaskList(taskList.map((t) => (t.id === task.id ? task : t)));
    console.log('On expander click Id:' + task.id);
  };

  return (
    <Gantt
      tasks={taskList}
      viewMode={ViewMode.Month}
      preStepsCount={1}
      locale={'US'}
      onExpanderClick={handleExpanderClick}
      TaskListHeader={TaskListHeader}
      TaskListTable={TaskListTable}
      columnWidth={50}
    />
  );
};

export default GanttPage;
