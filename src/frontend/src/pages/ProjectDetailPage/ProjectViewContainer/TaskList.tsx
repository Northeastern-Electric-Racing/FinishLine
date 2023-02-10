/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import PageBlock from '../../../layouts/PageBlock';
import { NERButton } from '../../../components/NERButton';
import { useAuth } from '../../../hooks/auth.hooks';
import { Add } from '@mui/icons-material';
import { Auth } from '../../../utils/types';
import { useToast } from '../../../hooks/toasts.hooks';
import TaskListTabPanel from './TaskListTabPanel';

interface TaskListProps {
  defaultClosed?: boolean;
}

// Page block containing task list view
const TaskList = ({ defaultClosed }: TaskListProps) => {
  const auth: Auth = useAuth();
  const taskListTitle: string = 'Task List';

  // TODO: delete me when you actually implement onClick
  const toast = useToast();

  const [value, setValue] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  const addTaskButton: JSX.Element = (
    <NERButton
      variant="contained"
      disabled={auth.user?.role === 'GUEST'}
      startIcon={<Add />}
      sx={{
        height: 32,
        px: '12px'
      }}
      onClick={() => toast.error("This button doesn't work yet. If you want to work on it go to issue #762", 3000)}
    >
      New Task
    </NERButton>
  );

  return (
    <PageBlock title={taskListTitle} headerRight={addTaskButton} defaultClosed={defaultClosed}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} variant="fullWidth" aria-label="task-list-tabs">
          <Tab label="In Progress" aria-label="in-progress" />
          <Tab label="In Backlog" aria-label="in-backlog" />
          <Tab label="Done" aria-label="done" />
        </Tabs>
      </Box>
      <TaskListTabPanel value={value} index={0} />
      <TaskListTabPanel value={value} index={1} />
      <TaskListTabPanel value={value} index={2} />
    </PageBlock>
  );
};

export default TaskList;
