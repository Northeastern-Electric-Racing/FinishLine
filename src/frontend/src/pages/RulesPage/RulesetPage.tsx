/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// List of rulesets for a specific ruleset type
import React from 'react';
import PageLayout from '../../components/PageLayout';
import { useHistory } from 'react-router-dom';
import AddNewFileModal from './components/AddNewFileModal';
import { NERButton } from '../../components/NERButton';
import { useToast } from '../../hooks/toasts.hooks';
import { useCreateRuleset, useParseRuleset } from '../../hooks/rules.hooks';
import { routes } from '../../utils/routes';

// FSAE ruleset versions or FHE ruleset versions
const RulesetPage: React.FC = () => {
  const [AddFileModalShow, setAddFileModalShow] = React.useState(false);
  const { mutateAsync: createRuleset } = useCreateRuleset();
  const { mutateAsync: parseRuleset } = useParseRuleset();
  const toast = useToast();
  const history = useHistory();

  const handleFileConfirm = async (data: {
    fileId: string;
    name: string;
    car: string;
    parserType: string;
  }) => {
    setAddFileModalShow(false);
    try {
      console.log('Creating ruleset...');
      const ruleset = await createRuleset({
        fileId: data.fileId,
        name: data.name,
        rulesetTypeId: data.car,
        carNumber: parseInt(data.car),
        active: false,
      });

      console.log('Full ruleset response:', ruleset);
      console.log('Ruleset type:', typeof ruleset);
      console.log('Ruleset keys:', Object.keys(ruleset));
      console.log('Ruleset.rulesetId:', ruleset.rulesetId);
      console.log('Ruleset.id:', ruleset.rulesetId);

      const rulesetId = ruleset.rulesetId || ruleset.rulesetId;

      if (!rulesetId) {
        console.error('No rulesetId found in response!');
        throw new Error('No rulesetId returned from createRuleset');
      }

      console.log('Parsing ruleset with ID:', rulesetId);
      const parsedRules = await parseRuleset({
        rulesetId,
        fileId: data.fileId,
        parserType: data.parserType as 'FSAE' | 'FHE'
      });
      console.log('Rules parsed:', parsedRules.length);
      toast.success(`Successfully parsed ${parsedRules.length} rules!`);
    } catch (e) {
      console.error('Error in handleFileConfirm:', e);
      toast.error('Error uploading file: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <PageLayout title="Ruleset">
     <NERButton variant="contained" onClick={() => setAddFileModalShow(!AddFileModalShow)}>
        Add New File
      </NERButton>
      <AddNewFileModal
        open={AddFileModalShow}
        onHide={() => setAddFileModalShow(false)}
        onFormSubmit={handleFileConfirm}
        carOptions={['1', '2']}
      />
       <NERButton onClick={() => history.push(`${routes.RULES}/placeholder_ruleset_id/edit`)}>MOCK edit/assign rules</NERButton>
    </PageLayout>
  );
};

export default RulesetPage;
