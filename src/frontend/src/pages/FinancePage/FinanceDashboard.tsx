import { EditBudgetModalForReason } from './FinanceComponents/EditBudgetModalForReason';
import { useState } from 'react';

const FinanceDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <EditBudgetModalForReason
      showModal={showModal}
      handleClose={handleClose}
      // otherReimbursementProductReasonId={'13f3ce7b-7879-463d-8c7c-4b82776cf383'}
    >
      Finance Dashboard
    </EditBudgetModalForReason>
  );
};

export default FinanceDashboard;
