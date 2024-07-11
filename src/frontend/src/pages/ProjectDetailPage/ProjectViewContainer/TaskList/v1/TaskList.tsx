/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AddTask } from '@mui/icons-material';
import { Box, Button, Tab, Tabs } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import { isLeadership, Project, Task, TaskStatus, wbsPipe } from 'shared';
import { useAuth } from '../../../../../hooks/auth.hooks';
import { routes } from '../../../../../utils/routes';
import { Auth } from '../../../../../utils/types';
import TaskListTabPanel from './TaskListTabPanel';
import LoadingIndicator from '../../../../../components/LoadingIndicator';

interface TaskListProps {
  project: Project;
}

// used two sort two Tasks based on ascending times
const sortAscendingDate = (task1: Task, task2: Task) => {
  const deadLine1 = task1.deadline.getTime();
  const deadLine2 = task2.deadline.getTime();

  if (deadLine1 !== deadLine2) return deadLine1 - deadLine2;
  return task1.dateCreated.getTime() - task2.dateCreated.getTime();
};

// Page block containing task list view
const TaskList = ({ project }: TaskListProps) => {
  const auth: Auth = useAuth();

  const [disabled, setDisabled] = useState<boolean>(false);
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
  const tasks = project.tasks.sort(sortAscendingDate);

  const backLogTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_BACKLOG);
  const inProgressTasks = tasks.filter((task: Task) => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = tasks.filter((task: Task) => task.status === TaskStatus.DONE);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  const { user } = auth;
  if (!user) return <LoadingIndicator />;

  const isWorkPackageLeadOrManager = project.workPackages.some((workPackage) => {
    return workPackage.lead?.userId === user.userId || workPackage.manager?.userId === user.userId;
  });

  const createTaskPermissions =
    isLeadership(user.role) ||
    project.lead?.userId === user.userId ||
    isWorkPackageLeadOrManager ||
    project.manager?.userId === user.userId ||
    project.teams.some((team) => team.head.userId === user.userId) ||
    project.teams.some((team) => team.leads.map((lead) => lead.userId).includes(user.userId)) ||
    project.teams.some((team) => team.members.map((member) => member.userId).includes(user.userId));

  const addTaskButton: JSX.Element = (
    <Button
      variant="outlined"
      disabled={!createTaskPermissions || project.teams.length === 0 || disabled}
      startIcon={<AddTask />}
      sx={{
        height: 32,
        px: '12px',
        textTransform: 'none',
        fontSize: 16,
        marginRight: 2
      }}
      onClick={() => setAddTask(true)}
    >
      New Task
    </Button>
  );

  return (
    <Box display="flex" flexDirection="row">
      <Box sx={{ borderRight: 1, borderColor: 'divider', paddingTop: 2 }}>
        {addTaskButton}
        <Tabs
          value={value}
          onChange={handleTabChange}
          orientation="vertical"
          variant="scrollable"
          aria-label="task-list-tabs"
        >
          <Tab
            label="In Backlog"
            aria-label="in-backlog"
            value={0}
            component={Link}
            to={`${routes.PROJECTS}/${wbsNum}/tasks/in-backlog`}
          />
          <Tab
            label="In Progress"
            aria-label="in-progress"
            value={1}
            component={Link}
            to={`${routes.PROJECTS}/${wbsNum}/tasks/in-progress`}
          />
          <Tab label="Done" aria-label="done" value={2} component={Link} to={`${routes.PROJECTS}/${wbsNum}/tasks/done`} />
        </Tabs>
      </Box>
      {value === 0 ? (
        <TaskListTabPanel
          tasks={backLogTasks}
          project={project}
          status={TaskStatus.IN_BACKLOG}
          addTask={addTask}
          onAddCancel={() => setAddTask(false)}
          setDisabled={setDisabled}
        />
      ) : value === 1 ? (
        <TaskListTabPanel
          tasks={inProgressTasks}
          project={project}
          status={TaskStatus.IN_PROGRESS}
          addTask={addTask}
          onAddCancel={() => setAddTask(false)}
          setDisabled={setDisabled}
        />
      ) : (
        <TaskListTabPanel
          tasks={doneTasks}
          project={project}
          status={TaskStatus.DONE}
          addTask={addTask}
          onAddCancel={() => setAddTask(false)}
          setDisabled={setDisabled}
        />
      )}
    </Box>
  );
};

export default TaskList;
