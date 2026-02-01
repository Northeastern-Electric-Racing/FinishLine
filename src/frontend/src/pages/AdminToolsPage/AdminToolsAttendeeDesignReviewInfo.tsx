import React, { useState } from 'react';
import { TextField, FormControl, FormLabel, TableCell, TableRow, Grid, Typography } from '@mui/material';
import NERTable from '../../components/NERTable';
import { useAllTeams } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';
import { useAllMembers } from '../../hooks/users.hooks';
import { useAllDesignReviews } from '../../hooks/design-reviews.hooks';
import { DesignReviewStatus } from 'shared';

const AdminToolsAttendeeDesignReviewInfo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allTeams, isLoading: teamsIsLoading, isError: teamsIsError, error: teamsError } = useAllTeams();
  const { data: allMembers, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllMembers();
  const {
    data: allDesignReviews,
    isLoading: designReviewsIsLoading,
    isError: designReviewsIsError,
    error: designReviewsError
  } = useAllDesignReviews();

  if (!allTeams || teamsIsLoading || !allMembers || usersIsLoading || !allDesignReviews || designReviewsIsLoading)
    return <LoadingIndicator />;
  if (teamsIsError) return <ErrorPage message={teamsError.message} />;
  if (usersIsError) return <ErrorPage message={usersError.message} />;
  if (designReviewsIsError) return <ErrorPage message={designReviewsError.message} />;

  const filteredMembers = allMembers.filter((member) =>
    fullNamePipe(member).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const attendanceDict: Map<string, number> = new Map();
  const missedDict: Map<string, number> = new Map();

  allDesignReviews.forEach((review) => {
    if (review.status === DesignReviewStatus.DONE) {
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
    }
  });

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
        Design Review Attendee Info
      </Typography>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <FormLabel htmlFor="search-by-name">Search by team member name</FormLabel>
        <TextField id="search-by-name" variant="outlined" value={searchQuery} onChange={handleSearchChange} fullWidth />
      </FormControl>
      <NERTable
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
