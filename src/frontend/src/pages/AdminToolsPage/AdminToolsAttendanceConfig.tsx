import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useAllAttendances } from '../../hooks/attendance.hooks';
import { fullNamePipe } from '../../utils/pipes';

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
                <TableCell colSpan={5} align="center">
                  No attendance records yet.
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((attendance) => (
                <TableRow key={attendance.meetingAttendanceId} hover>
                  <TableCell>{attendance.teamName}</TableCell>
                  <TableCell>{fullNamePipe(attendance.userCreated)}</TableCell>
                  <TableCell>{new Date(attendance.openedAt).toLocaleString()}</TableCell>
                  <TableCell>{attendance.attendeesCount}</TableCell>
                  <TableCell>{attendance.teamMemberAttendancePercent.toFixed(1)}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminToolsAttendanceConfig;
