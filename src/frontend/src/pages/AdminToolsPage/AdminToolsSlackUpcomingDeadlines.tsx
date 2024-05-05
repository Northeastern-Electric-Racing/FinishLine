/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NERButton } from '../../components/NERButton';
import { Box, Grid, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useSlackUpcomingDeadlines } from '../../hooks/work-packages.hooks';
import { DatePicker } from '@mui/x-date-pickers';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin } from 'shared';
import { useToast } from '../../hooks/toasts.hooks';
import HelpIcon from '@mui/icons-material/Help';

const AdminToolsSlackUpcomingDeadlines: React.FC = () => {
  const user = useCurrentUser();
  const toast = useToast();
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [disableButton, setDisableButton] = useState(false);
  const { mutateAsync, isLoading } = useSlackUpcomingDeadlines();

  const datePickerOnChange = (value: Date | null) => {
    if (value) setDeadline(value);
  };

  const slackUpcomingDeadlines = async () => {
    try {
      await mutateAsync(new Date(deadline.toDateString()));
      setDisableButton(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const tooltipMessage = (
    <Typography sx={{ fontSize: 14 }}>
      All work packages that have an end date up to and including the selected date will be messaged in Slack in the Leads
      channel.
    </Typography>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom color={'#ef4345'} borderBottom={1} borderColor={'white'}>
        Slack Upcoming Deadlines
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item display="flex" xs={12} sm="auto">
          <Tooltip title={tooltipMessage} placement="right" arrow sx={{ fontSize: 24 }}>
            <HelpIcon sx={{ mr: 2, height: 50 }} />
          </Tooltip>
          <DatePicker
            format="yyyy-MM-dd"
            onChange={datePickerOnChange}
            value={deadline}
            slotProps={{ textField: { autoComplete: 'off' } }}
          />
        </Grid>
        <Grid item>
          <NERButton
            variant="contained"
            disabled={!isAdmin(user.role) || disableButton || isLoading}
            onClick={slackUpcomingDeadlines}
          >
            Send
          </NERButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsSlackUpcomingDeadlines;
