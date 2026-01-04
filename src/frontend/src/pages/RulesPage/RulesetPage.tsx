/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import React from 'react';
import { NERButton } from '../../components/NERButton';
import AddNewFileModal from './components/AddNewFileModal';
import PageLayout from '../../components/PageLayout';
import { Box, Typography } from '@mui/material';
import RulesetTable from './components/RulesetTable';

/**
 * RulesetPage component for displaying and managing ruleset rules.
 * Supports editing and assigning rules to projects and teams.
 */
const RulesetPage: React.FC = () => {
  const history = useHistory();
  const [AddFileModalShow, setAddFileModalShow] = React.useState(false);

  const handleFileConfirm = async (data: { file: File; name: string; car: string; isActive: boolean }) => {
    setAddFileModalShow(false);
    console.log('Added data: ' + data); // delete this later, once data is used properly
  };

  return (
    <>
      {/* Breadcrumb Placeholder */}
      <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
        Rules / FSAE Ruleset
      </Typography>
      <PageLayout title="Rulesets">
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
              <NERButton onClick={() => history.push(`${routes.RULES}/placeholder_ruleset_id/edit`)}>
                MOCK edit/assign rules
              </NERButton>
            </Box>
          </Box>
        </Box>
      </PageLayout>
    </>
  );
};

export default RulesetPage;
