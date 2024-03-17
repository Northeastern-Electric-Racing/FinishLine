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
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import NERModal from '../../components/NERModal';

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

  const tableHeaderCellStyle = {
    borderRight: '2px solid white',
    borderBottom: '2px solid white'
  };

  const tableBodyCellStyle = {
    borderRight: '2px solid white'
  };

  const lastHeaderCellStyle = {
    borderBottom: '2px solid white'
  };

  const AttendeeModal = () => (
    <NERModal
      open={isModalOpen}
      onHide={handleCloseModal}
      title="Attendee Design Review Information"
      showCloseButton={true}
      hideFormButtons={true} // Set to false if you want to show form buttons
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={tableHeaderCellStyle}>Team Member Name</TableCell>
            <TableCell style={tableHeaderCellStyle}>No. Of Design Reviews Attended</TableCell>
            <TableCell style={lastHeaderCellStyle}>Required to come but did not</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Data row hookup, I've just put a stub there for now*/}
          <TableRow>
            <TableCell style={tableBodyCellStyle}>Batman</TableCell>
            <TableCell style={tableBodyCellStyle}>2</TableCell>
            <TableCell>4</TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={tableBodyCellStyle}>Superman</TableCell>
            <TableCell style={tableBodyCellStyle}>4</TableCell>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </NERModal>
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
            onClick={handleOpenModal}
          >
            Attendee Design Review Information
          </NERButton>
        </Grid>
      </Grid>
      <AttendeeModal />
    </PageBlock>
  );
};

export default AdminToolsSlackUpcomingDeadlines;
