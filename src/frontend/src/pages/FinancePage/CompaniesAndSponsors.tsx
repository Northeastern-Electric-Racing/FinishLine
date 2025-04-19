import { Box } from '@mui/system';
import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import NERTabs from '../../components/Tabs';
import { routes } from '../../utils/routes';
import { Typography } from '@mui/material';

const CompaniesAndSponsors: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const defaultTab = 'companies';
  const tabs = [
    { tabUrlValue: 'companies', tabName: 'Companies' },
    { tabUrlValue: 'sponsoring-vendors', tabName: 'Sponsoring Vendors' }
  ];

  return (
    <Box>
      <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '3rem' } }}>
        Companies and Sponsoring Vendors
      </Typography>
      <PageLayout
        title=" "
        tabs={
          <NERTabs
            setTab={setTabIndex}
            tabsLabels={tabs}
            baseUrl={routes.COMPANIES_SPONSORS}
            defaultTab={defaultTab}
            id="companies-and-sponsors-tabs"
          />
        }
      >
        {tabs[tabIndex]?.tabUrlValue === 'companies' && <div>Companies</div>}
        {tabs[tabIndex]?.tabUrlValue === 'sponsoring-vendors' && <div>Sponsoring Vendors</div>}
      </PageLayout>
    </Box>
  );
};

export default CompaniesAndSponsors;
