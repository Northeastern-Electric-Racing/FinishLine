import { useCurrentUser } from '../../../hooks/users.hooks';
import { isAdmin } from 'shared';
import React, { useEffect } from 'react';
import PopUpAlert from '../../../components/PopUpAlert';
import GeneralFinanceDashboard from './GeneralFinanceDashboard';
import AdminFinanceDashboard from './AdminFinanceDashboard';

const FinanceDashboard = () => {
  const user = useCurrentUser();

  return (
    <>
      {<PopUpAlert />}
      {isAdmin(user.role) || user.isFinance ? (
        <AdminFinanceDashboard />
      ) : (
        <GeneralFinanceDashboard />
      )}
    </>
  );
};

export default FinanceDashboard;
