import { Box, Typography, IconButton, Divider } from '@mui/material';
import { SearchBar } from '../../components/SearchBar';
import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReimbursementRequestTable from './ReimbursementRequestsSection';

const ReimbursementRequests = () => {
  const [searchText, setSearchText] = useState<string>('');
  return (
    <Box sx={{ padding: '15px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Reimbursement Requests</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ width: '300px' }}>
          <SearchBar placeholder="Search" searchText={searchText} setSearchText={setSearchText} />
        </Box>
        <IconButton color="primary" aria-label="filter">
          <FilterListIcon />
          <Typography variant="button">Filters</Typography>
        </IconButton>
      </Box>
      <ReimbursementRequestTable userReimbursementRequests={[]} allReimbursementRequests={[]} />
    </Box>
  );
};

export default ReimbursementRequests;
