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
import { useToast } from '../../../hooks/toasts.hooks';
import TaskListTabPanel from './TaskListTabPanel';
import { Task, TaskStatus, TeamPreview } from 'shared';

interface TaskListProps {
  tasks: Task[];
  team?: TeamPreview;
  defaultClosed?: boolean;
  hasPerms: boolean;
}

// Page block containing task list view
const TaskList = ({ tasks, defaultClosed, team, hasPerms }: TaskListProps) => {
  const auth: Auth = useAuth();
  const taskListTitle: string = 'Task List';

  // TODO: delete me when you actually implement onClick
  const toast = useToast();

  const [value, setValue] = useState<number>(1);

  const backLogTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_BACKLOG);
  const inProgressTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = tasks.filter((task: Task) => task.status === TaskStatus.DONE);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  const addTaskButton: JSX.Element = (
    <Button
      variant="outlined"
      disabled={auth.user?.role === 'GUEST'}
      startIcon={<AddTask />}
      sx={{
        height: 32,
        px: '12px',
        textTransform: 'none',
        fontSize: 16
      }}
      onClick={() => toast.error("This button doesn't work yet. If you want to work on it go to issue #762", 3000)}
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
        team={team}
        hasPerms={hasPerms}
      />
      <TaskListTabPanel
        tasks={inProgressTasks}
        value={value}
        index={1}
        status={TaskStatus.IN_PROGRESS}
        team={team}
        hasPerms={hasPerms}
      />
      <TaskListTabPanel tasks={doneTasks} value={value} index={2} status={TaskStatus.DONE} team={team} hasPerms={hasPerms} />
    </PageBlock>
  );
};

export default TaskList;
