import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Box } from '@mui/material';
import RulesetTypeTable from './components/RulesetTypeTable';
import { RulesActionButton } from './components/RulesActionButton';
import AddRulesetTypeModal from './components/AddRulesetTypeModal';
import { useState } from 'react';
import { useCreateRulesetType } from '../../hooks/rules.hooks';

const RulesetTypePage: React.FC = () => {
  const [addRulesetTypeModalShow, setAddRulesetTypeModalShow] = useState(false);

  const { mutateAsync: createRulesetType } = useCreateRulesetType();

  const handleAddRulesetTypeConfirm = async (data: { name: string }) => {
    await createRulesetType({ name: data.name });
  };

  const handleAddRulesetTypeCancel = () => {
    setAddRulesetTypeModalShow(false);
  };

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
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-end' },
                pr: '30px',
                pb: 2
              }}
            >
              <RulesActionButton variant="contained" onClick={() => setAddRulesetTypeModalShow(!addRulesetTypeModalShow)}>
                Add Ruleset Type
              </RulesActionButton>
              <AddRulesetTypeModal
                open={addRulesetTypeModalShow}
                onHide={handleAddRulesetTypeCancel}
                onFormSubmit={handleAddRulesetTypeConfirm}
              />
            </Box>
          </Box>
        </Box>
      </PageLayout>
    </>
  );
};

export default RulesetTypePage;
