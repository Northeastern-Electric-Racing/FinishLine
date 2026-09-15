import { useCurrentUser } from '../../../hooks/users.hooks';
import { isAdmin } from 'shared';
import React from 'react';
import GeneralFinanceDashboard from './GeneralFinanceDashboard';
import AdminFinanceDashboard from './AdminFinanceDashboard';

const FinanceDashboard = () => {
  const user = useCurrentUser();

  return isAdmin(user.role) || user.isFinance ? <AdminFinanceDashboard /> : <GeneralFinanceDashboard />;
};

export default FinanceDashboard;
