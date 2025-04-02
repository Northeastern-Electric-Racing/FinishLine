import { Box } from '@mui/system';
import Electrical from './FinanceDashboardTabs/Electrical';
import Mechanical from './FinanceDashboardTabs/Mechanical';
import Software from './FinanceDashboardTabs/Software';
import Business from './FinanceDashboardTabs/Business';
import Categories from './FinanceDashboardTabs/Categories';
import All from './FinanceDashboardTabs/All';
import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import NERTabs from '../../components/Tabs';
import { routes } from '../../utils/routes';

const FinanceDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <PageLayout
      title="Finance Budget Overview"
      tabs={
        <NERTabs
          setTab={setTabIndex}
          tabsLabels={[
            { tabUrlValue: 'all', tabName: 'all' },
            { tabUrlValue: 'electrical', tabName: 'Electrical' },
            { tabUrlValue: 'mechanical', tabName: 'Mechanical' },
            { tabUrlValue: 'software', tabName: 'Software' },
            { tabUrlValue: 'business', tabName: 'Business' },
            { tabUrlValue: 'categories', tabName: 'Categories' }
          ]}
          baseUrl={routes.FINANCE_DASHBOARD}
          defaultTab="electrical"
          id="finance-dashboard-tabs"
        />
      }
    >
      {tabIndex === 0 ? (
        <All />
      ) : tabIndex === 1 ? (
        <Electrical />
      ) : tabIndex === 2 ? (
        <Mechanical />
      ) : tabIndex === 3 ? (
        <Software />
      ) : tabIndex === 4 ? (
        <Business />
      ) : (
        <Categories />
      )}
    </PageLayout>
  );
};

export default FinanceDashboard;
