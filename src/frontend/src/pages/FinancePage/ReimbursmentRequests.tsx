import { Box, Typography, IconButton } from '@mui/material';
import { SearchBar } from '../../components/SearchBar';
import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReimbursementRequestTable from './ReimbursementRequestsSection';

const ReimbursementRequests: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  return (
    <Box sx={{ padding: '5px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3">Reimbursement Requests</Typography>
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
