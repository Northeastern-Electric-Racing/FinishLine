/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AddTask } from '@mui/icons-material';
import { Box, Button, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import { Task, TaskStatus, TeamPreview, WbsNumber, wbsPipe } from 'shared';
import { useAuth } from '../../../hooks/auth.hooks';
import PageBlock from '../../../layouts/PageBlock';
import { routes } from '../../../utils/routes';
import { Auth } from '../../../utils/types';
import TaskListTabPanel from './TaskListTabPanel';

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

  // Values that go in the URL depending on the tab value, example /projects/0.0.0/in-progress
  const tabUrlValues = ['in-backlog', 'in-progress', 'done'];

  const match = useRouteMatch<{ wbsNum: string; tabValueString: string }>('/projects/:wbsNum/:tabValueString');
  const tabValueString = match?.params?.tabValueString;
  const wbsNum = wbsPipe(currentWbsNumber);

  // Default to the "in-progress" tab
  const initialValue: number = tabUrlValues.indexOf(tabValueString ?? 'in-progress');
  const [value, setValue] = useState<number>(initialValue);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = tabUrlValues.indexOf(tabValueString ?? 'in-progress');
    setValue(newTabValue);
  }, [pathname]);

  const [addTask, setAddTask] = useState(false);

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
      onClick={() => setAddTask(true)}
    >
      New Task
    </Button>
  );

  return (
    <PageBlock title={taskListTitle} headerRight={addTaskButton} defaultClosed={defaultClosed}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} variant="fullWidth" aria-label="task-list-tabs">
          <Tab
            label="In Backlog"
            aria-label="in-backlog"
            value={0}
            component={Link}
            to={`${routes.PROJECTS}/${wbsNum}/in-backlog`}
          />
          <Tab
            label="In Progress"
            aria-label="in-progress"
            value={1}
            component={Link}
            to={`${routes.PROJECTS}/${wbsNum}/in-progress`}
          />
          <Tab label="Done" aria-label="done" value={2} component={Link} to={`${routes.PROJECTS}/${wbsNum}/done`} />
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
