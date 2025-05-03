import { useState } from 'react';
import { NERButton } from '../../components/NERButton';
import { EditBudgetModalForProject } from './FinanceComponents/EditBudgetModalProject';
import { Box } from '@mui/system';

const FinanceDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  // return <Box>Finance Dashboard</Box>;
  return (
    <Box>
      <NERButton onClick={() => setShowModal(true)}> Edit Budget</NERButton>
      <EditBudgetModalForProject showModal={showModal} handleClose={() => setShowModal(false)} />
    </Box>
  );
};

export default FinanceDashboard;
