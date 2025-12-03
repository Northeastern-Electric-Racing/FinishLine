/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import React from 'react';
import PageLayout from '../../components/PageLayout';
import AddNewFileModal from './components/AddNewFileModal';
import { NERButton } from '../../components/NERButton';

// FSAE or FHE page
const RulesetTypePage: React.FC = () => {
  // testing for modal
  const handleFileConfirm = async (data: { file: File; name: string; car: string; isActive: boolean }) => {
    setAddFileModalShow(false);
  };

  const [AddFileModalShow, setAddFileModalShow] = React.useState(false);
  return (
    <PageLayout title="Rules">
      <NERButton variant="contained" onClick={() => setAddFileModalShow(!AddFileModalShow)}>
        Add New File
      </NERButton>
      <AddNewFileModal
        open={AddFileModalShow}
        onHide={() => setAddFileModalShow(false)}
        onConfirm={handleFileConfirm}
        carOptions={['1', '2']}
      />
    </PageLayout>
  );
};

export default RulesetTypePage;
