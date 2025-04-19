import { useCurrentUser } from '../../../hooks/users.hooks';
import { isAdmin } from 'shared';
import React, { useEffect } from 'react';
import { useFinanceDashboardContext } from '../../../app/FinanceDashboardContext';
import PopUpAlert from '../../../components/PopUpAlert';
import GeneralFinanceDashboard from './GeneralFinanceDashboard';
import AdminFinanceDashboard from './AdminFinanceDashboard';

const FinanceDashboard = () => {
  const user = useCurrentUser();

  const { setCurrentFinanceDashboard } = useFinanceDashboardContext();

  useEffect(() => {
    setCurrentFinanceDashboard('lead/member');
  }, [setCurrentFinanceDashboard]);

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
