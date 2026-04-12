import { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useAllAttendances, useAttendanceById } from '../../hooks/attendance.hooks';
import { fullNamePipe } from '../../utils/pipes';
import { MeetingAttendance } from 'shared';

interface AttendanceRowProps {
  attendance: MeetingAttendance;
}

const AttendanceRow: React.FC<AttendanceRowProps> = ({ attendance }) => {
  const [open, setOpen] = useState(false);
  const { data: attendanceWithAttendees, isLoading } = useAttendanceById(attendance.meetingAttendanceId, open);

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setOpen((prev) => !prev)}>
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{attendance.teamName}</TableCell>
        <TableCell>{fullNamePipe(attendance.userCreated)}</TableCell>
        <TableCell>{new Date(attendance.openedAt).toLocaleString()}</TableCell>
        <TableCell>{attendance.attendeesCount}</TableCell>
        <TableCell>{attendance.teamMemberAttendancePercent.toFixed(1)}%</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1, px: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attendees
              </Typography>
              {isLoading ? (
                <LoadingIndicator />
              ) : !attendanceWithAttendees || attendanceWithAttendees.attendees.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No attendees recorded.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {attendanceWithAttendees.attendees.map((user) => (
                    <Typography key={user.userId} variant="body2">
                      {fullNamePipe(user)}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const AdminToolsAttendanceConfig: React.FC = () => {
  const { data: attendances, isLoading, isError, error } = useAllAttendances();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={(error as Error).message} />;

  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
        Attendance
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: 'transparent' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell sx={{ fontWeight: 600 }}>Team Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Initiated By</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date/Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Attendees</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>% of Team</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!attendances || attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No attendance records yet.
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((attendance) => <AttendanceRow key={attendance.meetingAttendanceId} attendance={attendance} />)
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminToolsAttendanceConfig;
