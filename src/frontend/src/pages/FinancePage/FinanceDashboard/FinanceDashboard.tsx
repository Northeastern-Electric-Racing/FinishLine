import { useCurrentUser } from '../../../hooks/users.hooks';
import { isAdmin, isHead, isLead } from 'shared';
import React, { useEffect } from 'react';
import { useFinanceDashboardContext } from '../../../app/FinanceDashboardContext';
import PopUpAlert from '../../../components/PopUpAlert';
import AdminFinanceDashboard from './AdminFinanceDashboard';
import HeadFinanceDashboard from './HeadFinanceDashboard';
import LeadFinanceDashboard from './LeadFinanceDashboard';

const FinanceDashboard = () => {
  const user = useCurrentUser();

  const { setCurrentFinanceDashboard } = useFinanceDashboardContext();

  useEffect(() => {
    setCurrentFinanceDashboard('lead/member');
  }, [setCurrentFinanceDashboard]);

  return (
    <>
      {<PopUpAlert />}
      {isHead(user.role) ? (
        <HeadFinanceDashboard user={user} />
      ) : isAdmin(user.role) || user.isFinance ? (
        <AdminFinanceDashboard user={user} />
      ) : (
        <LeadFinanceDashboard user={user} />
      )}
    </>
  );
};

export default FinanceDashboard;
