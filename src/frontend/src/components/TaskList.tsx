/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import PageBlock from '../layouts/PageBlock';
import { NERButton } from './NERButton';
import { useAuth } from '../hooks/auth.hooks';
import { Add } from '@mui/icons-material';

interface TaskListProps {
  defaultClosed?: boolean;
}

const TaskList = ({ defaultClosed }: TaskListProps) => {
  const auth = useAuth();
  const taskListTitle: string = 'Task List';
  const addTaskButton: React.ReactNode = (
    <NERButton
      variant="contained"
      disabled={auth.user?.role === 'GUEST'}
      startIcon={<Add />}
      onClick={() => alert("addTaskButton doesn't work yet. If you want to work on it go to issue #762")}
    >
      New Task
    </NERButton>
  );

  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // TabPanel stuff copied from https://mui.com/material-ui/react-tabs/ unless we install @mui/lab

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  };

  return (
    <PageBlock title={taskListTitle} headerRight={addTaskButton} defaultClosed={defaultClosed}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} variant="fullWidth" aria-label="task-list-tabs">
          <Tab label="In Progress" aria-label="in-progress" />
          <Tab label="In Backlog" aria-label="in-backlog" />
          <Tab label="Done" aria-label="done" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        Tasks In Progess
      </TabPanel>
      <TabPanel value={value} index={1}>
        Tasks In Backlog
      </TabPanel>
      <TabPanel value={value} index={2}>
        Tasks Done
      </TabPanel>
    </PageBlock>
  );
};

export default TaskList;
