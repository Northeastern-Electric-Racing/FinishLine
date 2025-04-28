import { Box, Button } from '@mui/material';
import React, { useState } from 'react';
import { EditBudgetModalForReason } from './FinanceComponents/EditBudgetModalForReason';

const FinanceDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const open = () => {
    setShowModal(true);
  };

  const close = () => {
    setShowModal(false);
  };

  return (
    <Box>
      <Button onClick={open}>Edit Budget</Button>
      <EditBudgetModalForReason showModal={showModal} handleClose={close} />
    </Box>
  );
};

export default FinanceDashboard;
