/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AddTask } from '@mui/icons-material';
import { Box, Button, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { Project, Task, TaskStatus } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAuth } from '../../../hooks/auth.hooks';
import PageBlock from '../../../layouts/PageBlock';
import TaskListTabPanel from './TaskListTabPanel';

const TASK_LIST_TITLE: string = 'Task List';

interface TaskListProps {
  project: Project;
  defaultClosed?: boolean;
}

//used two sort two Tasks based on ascending times
const sortAscDate = (task1: Task, task2: Task) => {
  const deadLine1 = task1.deadline.getTime();
  const deadLine2 = task2.deadline.getTime();

  if (deadLine1 !== deadLine2) return deadLine1 - deadLine2;
  return task1.dateCreated.getTime() - task2.dateCreated.getTime();
};

// Page block containing task list view
const TaskList = ({ project, defaultClosed }: TaskListProps) => {
  const auth = useAuth();
  const [value, setValue] = useState<number>(1);
  const [addTask, setAddTask] = useState(false);
  const tasks = project.tasks.sort(sortAscDate);

  const backLogTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_BACKLOG);
  const inProgressTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = tasks.filter((task: Task) => task.status === TaskStatus.DONE);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  const { user } = auth;
  if (!user) return <LoadingIndicator />;

  const createTaskPermissions =
    !(user.role === 'GUEST' && !project.team?.members.map((user) => user.userId).includes(user.userId)) &&
    !(
      user.role === 'MEMBER' &&
      (project.projectLead?.userId !== user.userId || project.projectManager?.userId !== user.userId) &&
      !(project.team?.leader.userId === user.userId)
    );

  const addTaskButton: JSX.Element = (
    <Button
      variant="outlined"
      disabled={!createTaskPermissions || !project.team}
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
    <PageBlock title={TASK_LIST_TITLE} headerRight={addTaskButton} defaultClosed={defaultClosed}>
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
        project={project}
        status={TaskStatus.IN_BACKLOG}
        addTask={addTask}
        onAddCancel={() => setAddTask(false)}
      />
      <TaskListTabPanel
        tasks={inProgressTasks}
        value={value}
        index={1}
        project={project}
        status={TaskStatus.IN_PROGRESS}
        addTask={addTask}
        onAddCancel={() => setAddTask(false)}
      />

      <TaskListTabPanel
        tasks={doneTasks}
        value={value}
        index={2}
        project={project}
        status={TaskStatus.DONE}
        addTask={addTask}
        onAddCancel={() => setAddTask(false)}
      />
    </PageBlock>
  );
};

export default TaskList;
