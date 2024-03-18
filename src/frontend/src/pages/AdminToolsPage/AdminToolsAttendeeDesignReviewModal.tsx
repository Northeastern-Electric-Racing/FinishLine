import React, { useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import NERModal from '../../components/NERModal';

interface AttendeeDesignReviewModalProps {
  open: boolean;
  onClose: () => void;
}

const AttendeeDesignReviewModal: React.FC<AttendeeDesignReviewModalProps> = ({ open, onClose }) => {
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
    <NERModal
      open={open}
      onHide={onClose}
      title="Attendee Design Review Information"
      showCloseButton={true}
      hideFormButtons={true}
    >
      <TextField
        label="Search by team member name"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <FormControl fullWidth>
        <InputLabel id="team-select-label">Team</InputLabel>
        <Select
          labelId="team-select-label"
          id="team-select"
          value={selectedTeam}
          label="Team"
          onChange={handleTeamChange}
          sx={{ marginBottom: 2 }}
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
    </NERModal>
  );
};

export default AttendeeDesignReviewModal;
