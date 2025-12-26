import PageLayout from '../../components/PageLayout';
import { Box, Button } from '@mui/material';
import RulesetTypeTable from './components/RulesetTypeTable';
import { NERButton } from '../../components/NERButton';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import AddRulesetTypeModal from './components/AddRulesetTypeModal';
import { useState } from 'react';
import { useCreateRulesetType } from '../../hooks/rules.hooks';

type RulesetTypeColumnId = 'id' | 'name' | 'lastUpdated' | 'revisions' | 'actions';

interface RulesetTypeHeadCell {
  id: RulesetTypeColumnId;
  label: string;
}

const RulesetTypePage: React.FC = () => {
  const history = useHistory();
  const [addRulesetTypeModalShow, setAddRulesetTypeModalShow] = useState(false);

  const { mutateAsync: createRulesetType } = useCreateRulesetType();

  const handleAddRulesetTypeConfirm = async (data: { name: string }) => {
    await createRulesetType({ name: data.name });
  };

  const handleAddRulesetTypeCancel = () => {
    setAddRulesetTypeModalShow(false);
  };

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
            <NERButton variant="contained" onClick={() => setAddRulesetTypeModalShow(!addRulesetTypeModalShow)}>
              Add Ruleset Type
            </NERButton>
            <AddRulesetTypeModal
              open={addRulesetTypeModalShow}
              onHide={handleAddRulesetTypeCancel}
              onFormSubmit={handleAddRulesetTypeConfirm}
            />
            {/* Temporary for navigation */}
            <NERButton onClick={() => history.push(`${routes.RULES}/placeholder_ruleset_id`)}>FSAE Ruleset</NERButton>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default RulesetTypePage;
