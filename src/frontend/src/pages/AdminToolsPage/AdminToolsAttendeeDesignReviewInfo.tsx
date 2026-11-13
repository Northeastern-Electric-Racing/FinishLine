import React, { useState } from 'react';
import { TextField, FormControl, FormLabel, TableCell, TableRow, Grid, Typography } from '@mui/material';
import NERTable from '../../components/NERTable';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';
import { useAllMembers } from '../../hooks/users.hooks';
import { useDesignReviewAttendance } from '../../hooks/calendar.hooks';

const AdminToolsAttendeeDesignReviewInfo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allMembers, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllMembers();
  const {
    data: attendance,
    isLoading: attendanceIsLoading,
    isError: eventsIsError,
    error: eventsError
  } = useDesignReviewAttendance();

  if (!allMembers || usersIsLoading || !attendance || attendanceIsLoading) return <LoadingIndicator />;
  if (usersIsError) return <ErrorPage message={usersError.message} />;
  if (eventsIsError) return <ErrorPage message={eventsError.message} />;

  const filteredMembers = allMembers.filter((member) =>
    fullNamePipe(member).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // completed events each member was required at, counted by the server
  const attendanceDict = new Map(attendance.map((row) => [row.userId, row.numAttended]));
  // TODO: "Required to come but did not" has never been tracked (it always showed 0); decide what it should count
  const missedDict: Map<string, number> = new Map();

  const attendeeRows = filteredMembers.map((member, index) => (
    <TableRow key={index}>
      <TableCell sx={{ borderBottom: index === filteredMembers.length - 1 ? 'none' : 'default' }}>
        {fullNamePipe(member)}
      </TableCell>
      <TableCell sx={{ borderBottom: index === filteredMembers.length - 1 ? 'none' : 'default' }}>
        {attendanceDict.get(member.userId) ?? 0}
      </TableCell>
      <TableCell
        sx={{
          borderBottom: index === filteredMembers.length - 1 ? 'none' : 'default'
        }}
      >
        {missedDict.get(member.userId) ?? 0}
      </TableCell>
    </TableRow>
  ));

  return (
    <Grid>
      <Typography variant="h5" color="#ef4345" borderBottom={1} borderColor={'white'} gutterBottom>
        Event Attendee Info
      </Typography>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <FormLabel htmlFor="search-by-name">Search by team member name</FormLabel>
        <TextField id="search-by-name" variant="outlined" value={searchQuery} onChange={handleSearchChange} fullWidth />
      </FormControl>
      <NERTable
        columns={[
          { name: 'Team Member Name', width: '33%' },
          { name: 'No. Of Events Attended', width: '33%' },
          { name: 'Required to come but did not', width: '34%' }
        ]}
        rows={attendeeRows}
      />
    </Grid>
  );
};

export default AdminToolsAttendeeDesignReviewInfo;
