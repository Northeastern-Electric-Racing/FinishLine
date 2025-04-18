import React, { createContext, useContext, useState } from 'react';

interface FinanceDashboardContextProps {
  onFinanceAdminDashboard: boolean;
  onHeadDashboard: boolean;
  onLeadOrBelowDashboard: boolean;
  setCurrentFinanceDashboard: (financeDashboard: FinanceDashboard) => void;
}

type FinanceDashboard = 'finance/admin' | 'head' | 'lead/member';

const FinanceDasboardContext = createContext<FinanceDashboardContextProps | undefined>(undefined);

export const FinanceDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onFinanceAdminDashboard, setOnFinanceAdminDashboard] = useState(false);
  const [onHeadDashboard, setOnHeadDashboard] = useState(false);
  const [onLeadOrBelowDashboard, setOnLeadOrBelowDashboard] = useState(false);

  const setCurrentFinanceDashboard = (financeDashboard: FinanceDashboard) => {
    switch (financeDashboard) {
      case 'finance/admin':
        setOnFinanceAdminDashboard(true);
        setOnHeadDashboard(false);
        setOnLeadOrBelowDashboard(false);
        break;
      case 'head':
        setOnFinanceAdminDashboard(false);
        setOnHeadDashboard(true);
        setOnLeadOrBelowDashboard(false);
        break;
      case 'lead/member':
        setOnFinanceAdminDashboard(false);
        setOnHeadDashboard(false);
        setOnLeadOrBelowDashboard(true);
        break;
    }
  };

  return (
    <FinanceDasboardContext.Provider
      value={{
        onFinanceAdminDashboard,
        onHeadDashboard,
        onLeadOrBelowDashboard,
        setCurrentFinanceDashboard
      }}
    >
      {children}
    </FinanceDasboardContext.Provider>
  );
};

export const useFinanceDashboardContext = () => {
  const context = useContext(FinanceDasboardContext);
  if (!context) {
    throw new Error('useFinanceDashboardContext must be used within a FinanceDashboardProvider');
  }
  return context;
};
