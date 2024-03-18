/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../../layouts/PageBlock';
import { NERButton } from '../../components/NERButton';
import { Grid, TextField, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useSlackUpcomingDeadlines } from '../../hooks/work-packages.hooks';
import { DatePicker } from '@mui/x-date-pickers';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin } from 'shared';
import { useToast } from '../../hooks/toasts.hooks';
import HelpIcon from '@mui/icons-material/Help';
import AttendeeDesignReviewModal from './AdminToolsAttendeeDesignReviewModal';

const AdminToolsSlackUpcomingDeadlines: React.FC = () => {
  const user = useCurrentUser();
  const toast = useToast();
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [disableButton, setDisableButton] = useState(false);
  const { mutateAsync, isLoading } = useSlackUpcomingDeadlines();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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
    <PageBlock title="Slack Upcoming Deadlines">
      <Grid container spacing={2} alignItems="center">
        <Grid item display="flex" xs={12} sm>
          <Tooltip title={tooltipMessage} placement="right" arrow sx={{ fontSize: 24 }}>
            <HelpIcon sx={{ mr: 2, height: 50 }} />
          </Tooltip>
          <DatePicker
            inputFormat="yyyy-MM-dd"
            onChange={datePickerOnChange}
            value={deadline}
            renderInput={(params) => <TextField autoComplete="off" {...params} />}
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
        <Grid item>
          <NERButton
            variant="contained"
            disabled={!isAdmin(user.role) || disableButton || isLoading}
            onClick={handleOpenModal} // Opens the modal
          >
            Attendee Design Review Information
          </NERButton>
        </Grid>
      </Grid>
      <AttendeeDesignReviewModal open={isModalOpen} onClose={handleCloseModal} />
    </PageBlock>
  );
};

export default AdminToolsSlackUpcomingDeadlines;
