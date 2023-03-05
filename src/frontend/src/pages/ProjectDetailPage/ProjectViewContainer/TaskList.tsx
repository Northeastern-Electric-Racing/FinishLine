/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Button, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import PageBlock from '../../../layouts/PageBlock';
import { useAuth } from '../../../hooks/auth.hooks';
import { AddTask } from '@mui/icons-material';
import { Auth } from '../../../utils/types';
import TaskListTabPanel from './TaskListTabPanel';
import { Task, TaskStatus, WbsNumber, TeamPreview } from 'shared';

interface TaskListProps {
  tasks: Task[];
  team?: TeamPreview;
  defaultClosed?: boolean;
  hasTaskPermissions: boolean;
  currentWbsNumber: WbsNumber;
}

// Page block containing task list view
const TaskList = ({ tasks, currentWbsNumber, defaultClosed, team, hasTaskPermissions }: TaskListProps) => {
  const auth: Auth = useAuth();
  const taskListTitle: string = 'Task List';

  const [value, setValue] = useState<number>(1);
  const [addTask, setAddTask] = useState(false);

  const backLogTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_BACKLOG);
  const inProgressTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = tasks.filter((task: Task) => task.status === TaskStatus.DONE);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  const disableAddTask: boolean = auth.user?.role === 'GUEST' || !team;

  const addTaskButton: JSX.Element = (
    <Button
      variant="outlined"
      disabled={disableAddTask}
      startIcon={<AddTask />}
      sx={{
        height: 32,
        px: '12px',
        textTransform: 'none',
        fontSize: 16
      }}
      onClick={() => setAddTask(true)}
    >
      New Task
    </Button>
  );

  return (
    <PageBlock title={taskListTitle} headerRight={addTaskButton} defaultClosed={defaultClosed}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} variant="fullWidth" aria-label="task-list-tabs">
          <Tab label="In Backlog" aria-label="in-backlog" />
          <Tab label="In Progress" aria-label="in-progress" />
          <Tab label="Done" aria-label="done" />
        </Tabs>
      </Box>
      <TaskListTabPanel
        tasks={backLogTasks}
        value={value}
        index={0}
        status={TaskStatus.IN_BACKLOG}
        addTask={addTask}
        onAddCancel={() => setAddTask(false)}
        currentWbsNumber={currentWbsNumber}
        team={team}
        hasTaskPermissions={hasTaskPermissions}
      />
      <TaskListTabPanel
        tasks={inProgressTasks}
        value={value}
        index={1}
        status={TaskStatus.IN_PROGRESS}
        addTask={addTask}
        onAddCancel={() => setAddTask(false)}
        currentWbsNumber={currentWbsNumber}
        team={team}
        hasTaskPermissions={hasTaskPermissions}
      />

      <TaskListTabPanel
        tasks={doneTasks}
        value={value}
        index={2}
        status={TaskStatus.DONE}
        team={team}
        hasTaskPermissions={hasTaskPermissions}
        addTask={addTask}
        onAddCancel={() => setAddTask(false)}
        currentWbsNumber={currentWbsNumber}
      />
    </PageBlock>
  );
};

export default TaskList;
