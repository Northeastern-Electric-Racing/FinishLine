/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Box } from '@mui/material';
import AddNewFileModal from './components/AddNewFileModal';
import { NERButton } from '../../components/NERButton';

// FSAE or FHE page
const RulesetTypePage: React.FC = () => {
  // testing for modal
  const handleFileConfirm = async (data: { file: File; name: string; car: string; isActive: boolean }) => {
    if (!data.file) {
      alert('Please upload a PDF file!');
      return;
    }
    console.log('Form submitted with:', data);
    setOpen(false);
  };
  const [open, setOpen] = React.useState(false);
  return (
    <PageLayout title="Rules">
      <NERButton onClick={() => setOpen(!open)}> Add New File </NERButton>
      <AddNewFileModal open={open} onHide={() => setOpen(false)} onConfirm={handleFileConfirm} carOptions={['1', '2']} />
    </PageLayout>
  );
};

export default RulesetTypePage;
