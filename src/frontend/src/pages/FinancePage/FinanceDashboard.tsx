import { Box } from '@mui/material';
import React, { useState } from 'react';
import { EditBudgetModalForReason } from './FinanceComponents/EditBudgetModalForReason';
import { NERButton } from '../../components/NERButton';

const FinanceDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <Box>
      <NERButton onClick={() => setShowModal(true)}>Edit Budget</NERButton>
      <EditBudgetModalForReason showModal={showModal} handleClose={() => setShowModal(false)} />
    </Box>
  );
};

export default FinanceDashboard;
