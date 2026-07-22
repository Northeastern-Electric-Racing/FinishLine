import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Box } from '@mui/material';
import RulesetTypeTable from './components/RulesetTypeTable';

const RulesetTypePage: React.FC = () => {
  return (
    <>
      <PageLayout title="Ruleset Types">
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)', pb: '80px' }}>
          <Box sx={{ flexGrow: 1 }}>
            <RulesetTypeTable />
          </Box>
          <Box
            sx={{
              backgroundColor: '#121313',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2,
              width: '100%',
              px: { xs: 1, md: 0 }
            }}
          >
            <Box
              sx={(theme) => ({
                borderBottom: `2px solid ${theme.palette.divider}`,
                mb: 2,
                ml: '20px'
              })}
            />
          </Box>
        </Box>
      </PageLayout>
    </>
  );
};

export default RulesetTypePage;
