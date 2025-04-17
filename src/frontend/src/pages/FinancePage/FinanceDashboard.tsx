import { Box, Button } from '@mui/material';
import { useState } from 'react';
import EditBudgetModal from '../FinancePage/FinanceComponents/EditBudgetModal';

const FinanceDashboard: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleEditSubmit = (data: any) => {
    console.log('Submitted data:', data);
  };

  return (
    <Box>
      <Button variant="contained" onClick={handleOpen}>
        Edit Budget
      </Button>

      <EditBudgetModal
        open={modalOpen}
        handleClose={handleClose}
        defaultValues={{ project: '', account: '', amount: '' }}
        onSubmit={handleEditSubmit}
      />
    </Box>
  );
};

export default FinanceDashboard;
