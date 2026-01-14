/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import React from 'react';
import { NERButton } from '../../components/NERButton';
import AddNewFileModal from './components/AddNewFileModal';
import PageLayout from '../../components/PageLayout';
import { Box } from '@mui/material';
import RulesetTable from './components/RulesetTable';
import { routes } from '../../utils/routes';
import { useParams } from 'react-router-dom';
import { useRulesetType } from '../../hooks/rules.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

/**
 * RulesetPage component for displaying and managing ruleset rules.
 * Supports editing and assigning rules to projects and teams.
 */
const RulesetPage: React.FC = () => {
  const [AddFileModalShow, setAddFileModalShow] = React.useState(false);

  interface ParamTypes {
    rulesetTypeId: string;
  }
  const { rulesetTypeId } = useParams<ParamTypes>();
  const { data: rulesetType, isLoading, isError, error } = useRulesetType(rulesetTypeId);

  const handleFileConfirm = async (data: { file: File; name: string; car: string; isActive: boolean }) => {
    setAddFileModalShow(false);
    console.log('Added data: ' + data); // delete this later, once data is used properly
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <>
      <PageLayout title={`${rulesetType?.name} Rulesets`} previousPages={[{ name: 'Rules', route: routes.RULES }]}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
          <Box sx={{ flexGrow: 1 }}>
            <RulesetTable />
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
              {/* Add New File Button */}
              <NERButton variant="contained" onClick={() => setAddFileModalShow(!AddFileModalShow)}>
                Add New File
              </NERButton>
              <AddNewFileModal
                open={AddFileModalShow}
                onHide={() => setAddFileModalShow(false)}
                onConfirm={handleFileConfirm}
                carOptions={['1', '2']}
              />
            </Box>
          </Box>
        </Box>
      </PageLayout>
    </>
  );
};

export default RulesetPage;
