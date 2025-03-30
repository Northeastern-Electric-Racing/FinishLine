import { Box, Button, Typography } from '@mui/material';
import { SearchBar } from '../../components/SearchBar';
import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReimbursementRequestTable from './ReimbursementRequestsSection';
import Timeline from './FinanceComponents/ReimbursementRequestTimeline';
import TimelineInfo from './FinanceComponents/_timeline_info';

const ReimbursementRequests: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  return (
    <Box sx={{ padding: '5px', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant="h3" sx={{ fontSize: { xs: '1.4rem', sm: '1.75rem', md: '3rem' } }}>
          Reimbursement Requests
        </Typography>
        <Box sx={{ width: { xs: '150px', sm: '200px', md: '250px' } }}>
          <SearchBar placeholder="Search" searchText={searchText} setSearchText={setSearchText} />
        </Box>
        <Button color="primary" aria-label="filter">
          <FilterListIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          <Typography variant="button" sx={{ fontSize: { xs: '0.5rem', sm: '0.875rem' } }}>
            Filters
          </Typography>
        </Button>
      </Box>
      <ReimbursementRequestTable userReimbursementRequests={[]} allReimbursementRequests={[]} />
      <Timeline events={TimelineInfo} />
    </Box>
  );
};

export default ReimbursementRequests;
