/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Link, Typography } from '@mui/material';

interface TaskListTabPanelProps {
  index: number;
  value: number;
}

const TaskListTabPanel = (props: TaskListTabPanelProps) => {
  const { value, index } = props;

  // Skeleton copied from https://mui.com/material-ui/react-tabs/.
  // If they release the TabPanel component from @mui/lab to @mui/material then change the div to TabPanel.

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>
            Contents of Panel {index}.{' '}
            <Link href="https://github.com/Northeastern-Electric-Racing/FinishLine/issues/761">Replace me</Link> with a task
            list data grid.
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default TaskListTabPanel;
