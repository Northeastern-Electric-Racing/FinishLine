/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Box } from '@mui/material';
import AddNewFileModal from './components/AddNewFileModal';

// FSAE or FHE page
const RulesetTypePage: React.FC = () => {
  // testing for modal
  const handleConfirm = async () => {
    console.log('test');
  };
  const [open, setOpen] = React.useState(false);
  return (
    <PageLayout title="Rules">
      <button onClick={() => setOpen(!open)}> modal test </button>
      <AddNewFileModal open={open} onHide={() => setOpen(false)} onConfirm={handleConfirm} />

      <Box></Box>
    </PageLayout>
  );
};

export default RulesetTypePage;
