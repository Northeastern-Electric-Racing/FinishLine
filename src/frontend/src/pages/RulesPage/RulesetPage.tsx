import { Box, Button, Typography } from '@mui/material';
import RulesetTable from './RulesetTable';

const RulesetPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb */}
      <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
        Rules / FSAE Ruleset
      </Typography>

      {/* Page Title */}
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
        FSAE Ruleset
      </Typography>

      {/* Table Component */}
      <RulesetTable />

      {/* Add New File Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#dd514c',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { backgroundColor: '#c74340' }
          }}
        >
          Add New File
        </Button>
      </Box>
    </Box>
  );
};

export default RulesetPage;
