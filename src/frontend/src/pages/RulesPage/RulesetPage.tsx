/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useParams } from 'react-router-dom';
import React from 'react';
import { useToast } from '../../hooks/toasts.hooks';
import { useCreateRuleset, useParseRuleset } from '../../hooks/rules.hooks';
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
  const { rulesetTypeId } = useParams<{ rulesetTypeId: string }>();

  const { mutateAsync: createRuleset } = useCreateRuleset();
  const { mutateAsync: parseRuleset } = useParseRuleset();
  const toast = useToast();

  const [AddFileModalShow, setAddFileModalShow] = React.useState(false);

  const handleFileConfirm = async (data: { fileId: string; name: string; carNumber: number; parserType: string }) => {
    setAddFileModalShow(false);
    try {
      const ruleset = await createRuleset({
        fileId: data.fileId,
        name: data.name,
        rulesetTypeId,
        carNumber: data.carNumber,
        active: false
      });
      const { rulesetId } = ruleset;

      if (!rulesetId) {
        throw new Error('Error creating Ruleset');
      }

      const parsedRules = await parseRuleset({
        rulesetId,
        fileId: data.fileId,
        parserType: data.parserType as 'FSAE' | 'FHE'
      });
      toast.success(`Successfully parsed ${parsedRules.length} rules!`);
    } catch (e) {
      toast.error('Error uploading file: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
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
                onFormSubmit={handleFileConfirm}
              />
            </Box>
          </Box>
        </Box>
      </PageLayout>
    </>
  );
};

export default RulesetPage;
