import React, { useState } from 'react';
import PageBlock from '../../layouts/PageBlock';
import {
  TextField,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';

const AdminToolsAttendeeDesignReviewInfo: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={tableHeaderCellStyle}>Team Member Name</TableCell>
            <TableCell style={tableHeaderCellStyle}>No. Of Design Reviews Attended</TableCell>
            <TableCell style={lastHeaderCellStyle}>Required to come but did not</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredMembers.map((member, index) => (
            <TableRow key={index}>
              <TableCell style={tableBodyCellStyle}>{member.name}</TableCell>
              <TableCell style={tableBodyCellStyle}>{member.reviewsAttended}</TableCell>
              <TableCell>{member.missedReviews}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageBlock>
  );
};

export default AdminToolsAttendeeDesignReviewInfo;
