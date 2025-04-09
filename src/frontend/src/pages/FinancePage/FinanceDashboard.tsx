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
import { Typography } from '@mui/material';

const FinanceDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <Box>
      <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '3rem' } }}>
        Finance Budget Overview
      </Typography>
      <PageLayout
        title=" "
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
            defaultTab="all"
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
    </Box>
  );
};

export default FinanceDashboard;
