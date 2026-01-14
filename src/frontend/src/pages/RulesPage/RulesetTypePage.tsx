import PageLayout from '../../components/PageLayout';
import { Box, Typography } from '@mui/material';
import RulesetTypeTable from './components/RulesetTypeTable';
import { NERButton } from '../../components/NERButton';
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
                borderBottom: '1px solid white',
                mb: 2
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-end' }
              }}
            >
              <NERButton variant="contained" onClick={() => setAddRulesetTypeModalShow(!addRulesetTypeModalShow)}>
                Add Ruleset Type
              </NERButton>
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
