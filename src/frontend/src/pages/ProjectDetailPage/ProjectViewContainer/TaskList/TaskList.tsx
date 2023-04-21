/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AddTask } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import { isLeadership, Project, Task, TaskStatus, wbsPipe } from 'shared';
import { useAuth } from '../../../../hooks/auth.hooks';
import { routes } from '../../../../utils/routes';
import { Auth } from '../../../../utils/types';
import TaskListTabPanel from './TaskListTabPanel';
import LoadingIndicator from '../../../../components/LoadingIndicator';

const TASK_LIST_TITLE: string = 'Task List';
interface TaskListProps {
  project: Project;
  index: number;
  value: number;
}

// Page block containing task list view
const TaskList = ({ project, index, value: projectTab }: TaskListProps) => {
  const auth: Auth = useAuth();
  const theme = useTheme();

  // Values that go in the URL depending on the tab value, example /projects/0.0.0/in-progress
  const tabUrlValues = useMemo(() => ['in-backlog', 'in-progress', 'done'], []);

  const match = useRouteMatch<{ wbsNum: string; tabValueString: string }>(
    `${routes.PROJECTS}/:wbsNum/Tasks/:tabValueString`
  );
  const tabValueString = match?.params?.tabValueString;
  const wbsNum = wbsPipe(project.wbsNum);

  // Default to the "in-progress" tab
  const initialValue: number = tabUrlValues.indexOf(tabValueString ?? 'in-progress');
  const [value, setValue] = useState<number>(initialValue);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = tabUrlValues.indexOf(tabValueString ?? 'in-progress');
    setValue(newTabValue);
  }, [pathname, setValue, tabUrlValues, tabValueString]);

  const [addTask, setAddTask] = useState(false);

  const tasks = project.tasks;
  const backLogTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_BACKLOG);
  const inProgressTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = tasks.filter((task: Task) => task.status === TaskStatus.DONE);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    console.log(newValue);
    setValue(newValue);
  };

  const { user } = auth;
  if (!user) return <LoadingIndicator />;

  const createTaskPermissions =
    isLeadership(user.role) ||
    project.projectLead?.userId === user.userId ||
    project.projectManager?.userId === user.userId ||
    project.team?.leader.userId === user.userId;

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
    <div>
      {index === projectTab && (
        <Card sx={{ my: 2, background: theme.palette.background.paper }} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  cursor: 'pointer'
                }}
              >
                {TASK_LIST_TITLE}
              </Typography>
              {addTaskButton}
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleTabChange} variant="fullWidth" aria-label="task-list-tabs">
                <Tab
                  label="In Backlog"
                  aria-label="in-backlog"
                  value={0}
                  component={Link}
                  to={`${routes.PROJECTS}/${wbsNum}/Tasks/in-backlog`}
                />
                <Tab
                  label="In Progress"
                  aria-label="in-progress"
                  value={1}
                  component={Link}
                  to={`${routes.PROJECTS}/${wbsNum}/Tasks/in-progress`}
                />
                <Tab
                  label="Done"
                  aria-label="done"
                  value={2}
                  component={Link}
                  to={`${routes.PROJECTS}/${wbsNum}/Tasks/done`}
                />
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskList;
