import PageLayout from '../../components/PageLayout';
import { Box, Button } from '@mui/material';
import RulesetTypeTable from './components/RulesetTypeTable';

const RulesetTypePage: React.FC = () => {
  return (
    <PageLayout title="Ruleset Types">
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
        <Box sx={{ flexGrow: 1 }}>
          <RulesetTypeTable />
        </Box>
        <Box
          sx={{
            backgroundColor: '#121313',
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            width: '100%',
            px: { xs: 1, md: 0 }
          }}
        >
          <Box
            sx={{
              borderBottom: '2px solid white',
              mb: 2
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-end' }
            }}
          >
            <Button
              className="viewButton"
              variant="contained"
              sx={{
                borderRadius: '8px',
                color: '#ededed',
                backgroundColor: '#dd514c',
                padding: { xs: '8px 16px', md: '2px 20px' },
                mb: 1,
                mr: { xs: 0, md: 2 },
                display: 'flex',
                fontSize: { xs: '14px', md: '16px' },
                fontWeight: 700,
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: '300px', sm: 'none' },
                '&:hover': {
                  backgroundColor: '#c74340'
                }
              }}
            >
              Add Ruleset
            </Button>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default RulesetTypePage;
