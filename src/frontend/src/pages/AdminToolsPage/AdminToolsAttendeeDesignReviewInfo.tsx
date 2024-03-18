import React, { useState } from 'react';
import PageBlock from '../../layouts/PageBlock';
import { TextField, FormControl, FormLabel, Select, MenuItem, SelectChangeEvent, TableCell, TableRow } from '@mui/material';
import AdminToolTable from './AdminToolTable';

const AdminToolsAttendeeDesignReviewInfo: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: to be deleted later, this is just stub data for filter options
  const teams = ['All', 'Team A', 'Team B', 'Team C'];

  // TODO: Stub data for team members, replace with dynamic data here
  const teamMembers = [
    { name: 'Batman', reviewsAttended: 2, missedReviews: 4 },
    { name: 'Superman', reviewsAttended: 4, missedReviews: 1 }
  ];

  // TODO: Filtering team members based on search query here
  const filteredMembers = teamMembers.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // TODO: Filtering for teams backend logic comes here
  const handleTeamChange = (event: SelectChangeEvent) => {
    setSelectedTeam(event.target.value as string);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const attendeeRows = filteredMembers.map((member, index) => (
    <TableRow key={index}>
      <TableCell sx={{ border: '2px solid black' }}>{member.name}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{member.reviewsAttended}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{member.missedReviews}</TableCell>
    </TableRow>
  ));

  return (
    <PageBlock title="Attendee Design Review Information">
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <FormLabel htmlFor="search-by-name">Search by team member name</FormLabel>
        <TextField id="search-by-name" variant="outlined" value={searchQuery} onChange={handleSearchChange} fullWidth />
      </FormControl>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <FormLabel id="team-select-label">Team</FormLabel>
        <Select
          labelId="team-select-label"
          id="team-select"
          value={selectedTeam}
          onChange={handleTeamChange}
          displayEmpty
          fullWidth
        >
          {teams.map((team) => (
            <MenuItem key={team} value={team}>
              {team}
            </MenuItem>
          ))}
          {/* TODO: we'll have to change this here as well for backend logic, above is just a stub implementation. */}
        </Select>
      </FormControl>
      <AdminToolTable
        columns={[
          { name: 'Team Member Name', width: '33%' },
          { name: 'No. Of Design Reviews Attended', width: '33%' },
          { name: 'Required to come but did not', width: '34%' }
        ]}
        rows={attendeeRows}
      />
    </PageBlock>
  );
};

export default AdminToolsAttendeeDesignReviewInfo;
