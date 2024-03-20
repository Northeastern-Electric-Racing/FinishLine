import React, { useState } from 'react';
import { TextField, FormControl, FormLabel, TableCell, TableRow, Grid, Typography } from '@mui/material';
import AdminToolTable from './AdminToolTable';
import { useAllTeams } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';
import { useAllUsers } from '../../hooks/users.hooks';
import { useAllDesignReviews } from '../../hooks/design-reviews.hooks';

const AdminToolsAttendeeDesignReviewInfo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allTeams, isLoading: teamsIsLoading, isError: teamsIsError, error: teamsError } = useAllTeams();
  const { data: allUsers, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllUsers();
  const {
    data: allDesignReviews,
    isLoading: designReviewsIsLoading,
    isError: designReviewsIsError,
    error: designReviewsError
  } = useAllDesignReviews();

  if (!allTeams || teamsIsLoading || !allUsers || usersIsLoading || !allDesignReviews || designReviewsIsLoading)
    return <LoadingIndicator />;
  if (teamsIsError) return <ErrorPage message={teamsError.message} />;
  if (usersIsError) return <ErrorPage message={usersError.message} />;
  if (designReviewsIsError) return <ErrorPage message={designReviewsError.message} />;

  const filteredMembers = allUsers.filter((member) =>
    fullNamePipe(member).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const attendanceDict: Map<number, number> = new Map();
  const missedDict: Map<number, number> = new Map();

  allDesignReviews.forEach((review) => {
    review.attendees.forEach((member) => {
      if (attendanceDict.has(member.userId)) {
        attendanceDict.set(member.userId, attendanceDict.get(member.userId)! + 1);
      } else {
        attendanceDict.set(member.userId, 1);
      }
    });
    review.requiredMembers.forEach((member) => {
      if (!review.attendees.map((user) => user.userId).includes(member.userId)) {
        if (missedDict.has(member.userId)) {
          missedDict.set(member.userId, missedDict.get(member.userId)! + 1);
        } else {
          missedDict.set(member.userId, 1);
        }
      }
    });
  });

  const attendeeRows = filteredMembers.map((member, index) => (
    <TableRow key={index}>
      <TableCell sx={{ border: '2px solid black' }}>{fullNamePipe(member)}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{attendanceDict.get(member.userId) ?? 0}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{missedDict.get(member.userId) ?? 0}</TableCell>
    </TableRow>
  ));

  return (
    <Grid>
      <Typography variant="h5" color="red" borderBottom={1} borderColor={'white'} gutterBottom>
        Design Review Attendee Info
      </Typography>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <FormLabel htmlFor="search-by-name">Search by team member name</FormLabel>
        <TextField id="search-by-name" variant="outlined" value={searchQuery} onChange={handleSearchChange} fullWidth />
      </FormControl>
      <AdminToolTable
        columns={[
          { name: 'Team Member Name', width: '33%' },
          { name: 'No. Of Design Reviews Attended', width: '33%' },
          { name: 'Required to come but did not', width: '34%' }
        ]}
        rows={attendeeRows}
      />
    </Grid>
  );
};

export default AdminToolsAttendeeDesignReviewInfo;
